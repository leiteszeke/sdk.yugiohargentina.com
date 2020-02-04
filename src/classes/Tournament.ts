import TournMatch from "./TournMatch";
import TournStaff from "./TournStaff";
import TournPlayer from "./TournPlayer";
import TournMatchResult from "./TournMatchResult";
import TournamentStyle from "./TournamentStyle";
import TournamentType from "./TournamentType";
import TournamentStructure from "./TournamentStructure";
import TournamentPairingStructure from "./TournamentPairingStructure";
import Penalty from "./Penalty";
import Player from "./Player";
import PlayerPoints from "./PlayerPoints";
import { ITournament } from '../types';

export default class Tournament {
  private _date: Date = new Date();
  private _tournamentType: TournamentType = TournamentType.Local;
  private _location?: Location;
  private _tiebreakerRoundCalculated: number = 0;
  private _matches: Array<TournMatch> = new Array<TournMatch>();
  private _staff?: Array<TournStaff>;
  private _penalties?: Array<Penalty>;
  private _topCut: number = 0;
  private _id: number;
  private _name: string = "";
  private _structure: TournamentStructure = TournamentStructure.Swiss;
  private _pairingStructure: TournamentPairingStructure = TournamentPairingStructure.Swiss;
  private _format: TournamentStyle = TournamentStyle.ConstructedAdvanced;
  private _players: Array<TournPlayer> = Array<TournPlayer>();
  private _currentRound: number = 0;
  private _playoffRound: number = 0;
  private _tableOffset: number = 0;
  private _finalized: boolean = false;

  // Check
  private _activePlayers: Array<TournPlayer> = Array<TournPlayer>();

  constructor({ id, name, location, players }: ITournament = {}) {
    this._id = id ? id : Math.random();
    this._name = name ? name : `Torneo ${this._id}`;

    if (location) {
      this._location = location;
    }

    if (players) {
      this._players = players;
    }
  }

  id(): number {
    return this._id;
  }

  name(): string {
    return this._name;
  }

  setName(value: string) {
    this._name = value;
  }

  date(): Date {
    return this._date;
  }

  setDate(value: Date) {
    this._date = value;
  }

  location(): Location | undefined {
    return this._location;
  }

  setLocation(value: Location) {
    this._location = value;
  }

  // Players

  setPlayers(players: Array<TournPlayer>) {
    this._players = players;
    this._activePlayers = this.getActivePlayers();
  }

  players(): Array<TournPlayer> {
    return this._players;
  }

  getActivePlayers(): Array<TournPlayer> {
    return this._players.filter((player: TournPlayer) => player.isActive());
  }

  addPlayer(player: TournPlayer) {
    this._players.push(player);
  }

  removePlayer(player: TournPlayer) {
    const index = this._players.findIndex((p: TournPlayer) => p.playerId() === player.playerId());

    if (index >= 0) {
      this._players.slice(index, 1);
    }
  }

  // Matches

  setMatches(matches: Array<TournMatch>) {
    this._matches = matches;
  }

  addMatch(match: TournMatch) {
    this._matches.push(match);
  }

  getMatchesByPlayer(player: TournPlayer): Array<TournMatch> {
    let matches: Array<TournMatch> = new Array<TournMatch>();

    this._matches.forEach((match: TournMatch) => {
      const playerInMatch: TournMatch | null = match.GetByPlayer(
        player.playerId()
      );
      if (playerInMatch !== null) matches.push(playerInMatch);
    });

    return matches;
  }

  // Rounds

  nextRound() {
    this._currentRound++;
  }

  round(): number {
    return this._currentRound;
  }

  setRound(value: number) {
    this._currentRound = value;
  }

  // Tournament Methods

  getPairings() {
    this.calculateTies(this._currentRound);
    const players: Array<TournPlayer> = this._players.map(a => a).sort((a, b) => a.Tie2_Points() - b.Tie2_Points());
    console.log(players);
  }

  calculateRounds() {
    const totalPlayers: number = this._players.length;
    let totalRounds: number = 0;
    let topCut: number = 0;

    if (totalPlayers >= 4 && totalPlayers <= 8) {
      totalRounds = 3;
      topCut = 0;
    }

    if (totalPlayers >= 9 && totalPlayers <= 16) {
      totalRounds = 4;
      topCut = 4;
    }

    if (totalPlayers >= 17 && totalPlayers <= 32) {
      totalRounds = 5;
      topCut = 4;
    }

    if (totalPlayers >= 33 && totalPlayers <= 64) {
      totalRounds = 6;
      topCut = 8;
    }

    if (totalPlayers >= 65 && totalPlayers <= 128) {
      totalRounds = 7;
      topCut = 8;
    }

    if (totalPlayers >= 129 && totalPlayers <= 256) {
      totalRounds = 8;
      topCut = 16;
    }

    if (totalPlayers >= 257 && totalPlayers <= 512) {
      totalRounds = 9;
      topCut = 16;
    }

    if (totalPlayers >= 513 && totalPlayers <= 1024) {
      totalRounds = 10;
      topCut = 32;
    }

    if (totalPlayers >= 1025 && totalPlayers <= 2048) {
      totalRounds = 11;
      topCut = 32;
    }

    if (totalPlayers >= 2045) {
      totalRounds = 12;
      topCut = 64;
    }

    this._tiebreakerRoundCalculated = totalRounds;
    this._topCut = topCut;
  }

  start() {
    if (this._players.length < 4) {
      throw new Error('no_players');
    }

    if (this._currentRound > 1) {
      throw new Error('started');
    }

    this._finalized = false;
    this.calculateRounds();
  }

  finish() {
    if (this._currentRound === 0) {
      throw new Error('you not started this tournament');
    }

    if (this.getUnreportedMatches().length > 0) {
      throw new Error('you have unreported matches');
    }

    this._finalized = true;
  }

  isFinish(): boolean {
    return this._finalized;
  }

  isPlayoffs(): boolean {
    return this._playoffRound > 0;
  }

  calculateTies(roundNumber: number): void {
    if (this._tiebreakerRoundCalculated === roundNumber) return;
    const dictionary: Map<number, PlayerPoints> = new Map<number, PlayerPoints>();

    this._players.forEach((player: TournPlayer) => {
      const byPlayer: Array<TournMatch> = this.getMatchesByPlayer(player);
      const playerPoints: PlayerPoints = new PlayerPoints(player.playerId());

      byPlayer.forEach((match: TournMatch) => {
        if (match.round() <= roundNumber) {
          if (!this.isPlayoffs() || match.round() < this._playoffRound) {
            if (match.GetOpponentId(player.playerId()) !== Player.BYE_ID) {
              playerPoints.addOpp(match.GetOpponentId(player.playerId()));
              playerPoints.addMatch();
            }
          }

          if (match.status() === TournMatchResult.Draw) {
            playerPoints.addDraw();
          } else if (match.winner() === player.playerId()) {
            if (this._playoffRound > 0 && match.round() >= this._playoffRound) {
              playerPoints.addPlayoffPoints();
            } else {
              playerPoints.addWin();
            }
          }
        }

        dictionary.set(playerPoints.playerId(), playerPoints);
      });
    });

    dictionary.forEach((playerPoints1: PlayerPoints) => {
      playerPoints1.Opps().forEach((opp: number) => {
        if (dictionary.has(opp)) {
          const playerPoints2: PlayerPoints | undefined = dictionary.get(opp);
          if (playerPoints2) {
            playerPoints1.sumOppWins(playerPoints2.wins());
            playerPoints1.sumOppDraws(playerPoints2.draws());
            playerPoints1.sumOppMatches(playerPoints2.matches());
          }
        }
      });
    });

    dictionary.forEach((playerPoints1: PlayerPoints) => {
      playerPoints1.Opps().forEach((opp: number) => {
        if (dictionary.has(opp)) {
          const playerPoints2: PlayerPoints | undefined = dictionary.get(opp);
          if (playerPoints2) {
            playerPoints1.sumOppOppWins(playerPoints2.oppWins());
            playerPoints1.sumOppOppDraws(playerPoints2.oppDraws());
            playerPoints1.sumOppOppMatches(playerPoints2.oppMatches());
          }
        }
      });
    });

    this._players.forEach((player: TournPlayer) => {
      player.clearTies();

      if (dictionary.has(player.playerId())) {
        const playerPoints: PlayerPoints | undefined = dictionary.get(
          player.playerId()
        );

        if (playerPoints) {
          player.setPlayoffPoints(playerPoints.playoffPoints());
          player.setTie1_Wins(playerPoints.WinPoints());
          player.setTie2_Points(playerPoints.WinPoints() * 1000000);
          if (playerPoints.oppMatches() > 0) {
            player.setTie2_Points(
              player.Tie2_Points() +
                Math.min(
                  999,
                  (playerPoints.OppWinPoints() * 1000) /
                    (playerPoints.oppMatches() * 3)
                ) *
                  1000
            );
          }

          if (playerPoints.oppOppMatches() > 0) {
            player.setTie2_Points(
              player.Tie2_Points() +
                Math.min(
                  999,
                  (playerPoints.OppOppWinPoints() * 1000) /
                    (playerPoints.oppOppMatches() * 3)
                )
            );
          }
        }
      }
    });
  }

  currentRound(): number {
    return this._currentRound;
  }

  currentMatches(): Array<TournMatch> {
    return this._matches.filter((m: TournMatch) => m.round() === this._currentRound);
  }

  getUnreportedMatches(): Array<TournMatch> {
    return this._matches.filter((m: TournMatch) => m.round() !== 0 && !m.isCompleted());
  }

  sortPlayersByRank(players: Array<TournPlayer>): void {
    players.sort((a, b) => b.rank() - a.rank());
  }

  hasTopCut(): boolean {
    return this._topCut > 0;
  }

  sortPlayersById(players: Array<TournPlayer>): Array<TournPlayer> {
    return players.map(a => a).sort((a, b) => a.playerId() - b.playerId());
  }

  shufflePlayers(players: Array<TournPlayer>): Array<TournPlayer> {
    return players;
  }

  shufflePlayersKeepRank(players: Array<TournPlayer>): Array<TournPlayer> {
    return players;
  }

  sortByRoundTable(matches: Array<TournMatch>): Array<TournMatch> {
    return matches;
  }

  sortByPointsByesLast(matches: Array<TournMatch>): Array<TournMatch> {
    return matches;
  }

  pairingsDupeCheck(unmatchedPlayers: Array<TournPlayer>, playedMatches: Array<TournMatch>): number {
    const hasPlayed = (player: TournPlayer, player2: TournPlayer): boolean => {
      let played = false;

      playedMatches.forEach((m: TournMatch) => {
        if (!played) {
          const filtered = m.players().filter((p: TournPlayer) =>
            p.playerId() === player.playerId()
            || p.playerId() === player2.playerId()
          )

          if (filtered.length === 2) {
            played = true;
          }
        }
      })

      return played;
    }

    for (let index: number = 0; index < unmatchedPlayers.length / 2; ++index) {
      if (hasPlayed(unmatchedPlayers[index * 2], unmatchedPlayers[index * 2 + 1])) {
        return index * 2;
      }
    }

    return -1;
  }

  resolveSwaps(players: Array<TournPlayer>, swaps: Set<number>): Array<TournPlayer> {
    const tournPlayerArray: Array<TournPlayer> = players.map(a => a);

    if (swaps.size === 0 || players.length === 0) {
      return tournPlayerArray;
    }

    const copySwap = Array.from(swaps);
    let tournPlayer1: TournPlayer = players[copySwap[0]];

    for (let index1: number = 0; index1 < copySwap.length; ++index1) {
      const index2: number = index1 === copySwap.length - 1 ? copySwap[0] : copySwap[index1 + 1];
      const tournPlayer2: TournPlayer = tournPlayerArray[index2];
      tournPlayerArray[index2] = tournPlayer1;
      tournPlayer1 = tournPlayer2;
      tournPlayerArray[copySwap[0]] = tournPlayer1;
    }

    return tournPlayerArray;
  }

  scanForNonDupePairings(
    currentPlayers: Array<TournPlayer>,
    histories: Array<TournMatch>,
    highPoints: number,
    lowPoints: number,
    swapList: Set<number>,
    remainingSlots: number
  ): Array<TournPlayer> {
    for (let index: number = 0; index < currentPlayers.length; ++index) {
      if (
        currentPlayers[index].Tie1_Wins() >= lowPoints &&
        currentPlayers[index].Tie1_Wins() <= highPoints &&
        !swapList.has(index)
      ) {
        const intList: Set<number> = new Set<number>();
        swapList.forEach((i: number) => intList.add(i));
        intList.add(index);

        if (remainingSlots === 1) {
          const unmatchedPlayers: Array<TournPlayer> = this.resolveSwaps(currentPlayers, intList);
          const num: number = this.pairingsDupeCheck(unmatchedPlayers, histories);
          if (num === -1 || num > Array.from(swapList)[0]) {
            return unmatchedPlayers;
          }
        } else {
          const tournPlayerArray: Array<TournPlayer> = this.scanForNonDupePairings(currentPlayers, histories, highPoints, lowPoints, intList, remainingSlots - 1);
          if (tournPlayerArray.length > 0) {
            return tournPlayerArray;
          }
        }
      }
    }

    return new Array<TournPlayer>();
  }

  getStandings(): Array<TournPlayer> {
    return this._players.sort((a, b) => b.Tie2_Points() - a.Tie2_Points());
  }

  pairNextRound() {
    if (this._activePlayers.length < 2) {
      throw new Error('we need more players');
    }

    if (this.getUnreportedMatches().length > 0) {
      throw new Error('there are unreported matches');
    }

    if (this._currentRound >= this._tiebreakerRoundCalculated && this._tiebreakerRoundCalculated > 0) {
      let message: string = `there are no more rounds`;

      if (this._topCut > 0) {
        message += `, you must proceed to top cup ${this._topCut}`;
      }

      throw new Error(message);
    }

    this.calculateTies(this._currentRound);

    let num1: number = 1;
    let round = this._currentRound + 1;

    if (this.isPlayoffs() || this._pairingStructure === TournamentPairingStructure.SingleElimination) {
      let num2: number = 1;

      if (round === 1 || round === this._playoffRound) {
        const activePlayers: Array<TournPlayer> = this._activePlayers;
        this.sortPlayersByRank(activePlayers);

        if (this._pairingStructure === TournamentPairingStructure.SingleElimination) {
          this.shufflePlayers(activePlayers);
        }

        let num3: number = Math.pow(2.0, Math.ceil(Math.log(activePlayers.length)));
        const intList1: Set<number> = new Set<number>();
        const intList2: Set<number> = new Set<number>();

        intList2.add(1);

        while (intList1.size < num3) {
          const intList3: Set<number> = new Set<number>();

          intList2.forEach((num4: number) => {
            intList3.add(num4);
            intList3.add(intList2.size * 2 + 1 - num4);
          });

          if (intList3.size >= num3) {
            intList3.forEach((item: number) => intList1.add(item));
          } else {
            intList2.clear();
            intList3.forEach((item: number) => intList2.add(item));
          }
        }

        for (let index1: number = 0; index1 < intList1.size; index1 += 2) {
          const index2: number = Array.from(intList1)[index1] - 1;
          const index3: number = Array.from(intList1)[index1 + 1] - 1;
          const players: Array<TournPlayer> = new Array<TournPlayer>();
          let submitResult: boolean = false;

          if (index2 < activePlayers.length) {
            players.push(activePlayers[index2]);
          } else {
            players.push(new TournPlayer(Player.ByePlayer));
          }

          if (index3 < activePlayers.length) {
            players.push(activePlayers[index3]);
          } else {
            players.push(new TournPlayer(Player.ByePlayer));
            submitResult = true;
          }

          const tournMatch: TournMatch = new TournMatch({
            table: num2++,
            round,
            playoffMatch: true,
            players,
          });

          if (submitResult) {
            tournMatch.setResult(TournMatchResult.Winner, tournMatch.players()[0].playerId());
          }

          this.sortPlayersById(tournMatch.players())
          this.addMatch(tournMatch);
        }
      } else {
        const byRound: Array<TournMatch> = this._matches.filter((m: TournMatch) => m.round() === this._currentRound);

        if (byRound.length % 2 === 1) {
          this.sortByRoundTable(byRound);

          const players: Array<TournPlayer> = [
            new TournPlayer(Player.ByePlayer),
            new TournPlayer(Player.ByePlayer),
          ];

          const tournMatch: TournMatch = new TournMatch({
            table: byRound[byRound.length - 1].table() + 1,
            round: byRound[byRound.length - 1].round(),
            players,
            winner: Player.BYE_ID,
            status: TournMatchResult.Winner,
          });

          byRound.push(tournMatch);
          // byRound.AddMatch((ITournMatch) tournMatch);
        }

        this.sortByRoundTable(byRound);

        for (let index1: number = 0; index1 < byRound.length; index1 += 2) {
          const players: Array<TournPlayer> = new Array<TournPlayer>();

          if (index1 < byRound.length) {
            if (byRound[index1].status() === TournMatchResult.Winner) {
              const byId: TournPlayer | undefined = byRound[index1].players().find((p: TournPlayer) => p.playerId() === byRound[index1].winner());

              if (byId && byId.isActive()) {
                players.push(byId)
              } else {
                players.push(new TournPlayer(Player.ByePlayer));
              }
            } else {
              players.push(new TournPlayer(Player.ByePlayer));
            }
          } else {
            players.push(new TournPlayer(Player.ByePlayer));
          }

          const index2: number = index1 + 1;

          if (index2 < byRound.length) {
            if (byRound[index2].status() === TournMatchResult.Winner) {
              const byId: TournPlayer | undefined = byRound[index2].players().find((p: TournPlayer) => p.playerId() === byRound[index2].winner())

              if (byId && byId.isActive()) {
                players.push(byId)
              } else {
                players.push(new TournPlayer(Player.ByePlayer));
              }
            } else {
              players.push(new TournPlayer(Player.ByePlayer));
            }
          } else {
            players.push(new TournPlayer(Player.ByePlayer));
          }

          const tournMatch: TournMatch = new TournMatch({
            round,
            table: num2++,
            players,
            playoffMatch: false,
          });

          this.addMatch(tournMatch);
        }
      }
    } else {
      // Agarro todos los jugadores activos
      let unmatchedPlayers1: Array<TournPlayer> = [...this._activePlayers];
      // Ordeno los jugadores por ranking
      this.sortPlayersByRank(unmatchedPlayers1);
      // Mezclo a los jugadores manteniendo el ranking
      this.shufflePlayersKeepRank(unmatchedPlayers1);


      const tournPlayerArray: Array<TournPlayer> = [...unmatchedPlayers1];
      const matchHistoryList: Array<TournMatch> = new Array<TournMatch>();

      this._matches.forEach((match: TournMatch) => {
        if (match.round() < round) {
          matchHistoryList.push(match);
        }
      });

      let index1: number = this.pairingsDupeCheck(unmatchedPlayers1, matchHistoryList);

      while (index1 !== -1) {
        const tie1Wins: number = unmatchedPlayers1[index1].Tie1_Wins();
        const swapList: Set<number> = new Set<number>();
        swapList.add(index1);
        let unmatchedPlayers2: Array<TournPlayer> = new Array<TournPlayer>();

        for (let index2: number = 0; index2 < round * 2; ++index2) {
          const highPoints: number = tie1Wins + (index2 + 1) / 2;
          const lowPoints: number = tie1Wins - index2 / 2;

          for (let remainingSlots: number = 1; remainingSlots <= unmatchedPlayers1.length; ++remainingSlots) {
            unmatchedPlayers2 = this.scanForNonDupePairings(unmatchedPlayers1, matchHistoryList, highPoints, lowPoints, swapList, remainingSlots);

            if (unmatchedPlayers2.length > 0) {
              break;
            }
          }

          if (unmatchedPlayers2.length > 0) {
            break;
          }
        }

        if (unmatchedPlayers2.length === 0) {
          unmatchedPlayers1 = tournPlayerArray;
          break;
        }

        index1 = this.pairingsDupeCheck(unmatchedPlayers2, matchHistoryList);
        unmatchedPlayers1 = unmatchedPlayers2;
      }

      while (unmatchedPlayers1.length > 1) {
        const players: Array<TournPlayer> = [
          unmatchedPlayers1[0],
          unmatchedPlayers1[1]
        ]

        const tournMatch: TournMatch = new TournMatch({
          round,
          table: num1,
          players,
        });

        unmatchedPlayers1.splice(0, 2);
        num1++;
        this.addMatch(tournMatch);
      }

      if (unmatchedPlayers1.length > 0) {
        const players: Array<TournPlayer> = [
          unmatchedPlayers1[0],
          new TournPlayer(Player.ByePlayer),
        ];

        const tournMatch: TournMatch = new TournMatch({
          players,
          table: num1,
          round,
          winner: unmatchedPlayers1[0].playerId(),
          status: TournMatchResult.Winner,
        })

        num1++;
        this.addMatch(tournMatch);
      }

      const byRound: Array<TournMatch> = this._matches.filter((m: TournMatch) => m.round() === round);
      this.sortByRoundTable(byRound);
      const intList: Set<number> = new Set<number>();

      for (let index2: number = 1; index2 < byRound.length + 1; ++index2) {
        intList.add(index2);
      }

      this.sortByPointsByesLast(byRound);

      byRound.forEach((tournMatch: TournMatch) => {
        tournMatch.players().forEach((player: TournPlayer) => {
          if (player.assignedSeat() > 0) {
            tournMatch.setTable(player.assignedSeat() - this._tableOffset);
            intList.delete(tournMatch.table());
            return true;
          }
        });
      });

      let num2: number = byRound.length + 1;

      byRound.forEach((tournMatch: TournMatch) => {
        if (tournMatch.table() === -1) {
          if (intList.size > 0) {
            tournMatch.setTable(Array.from(intList)[0]);
            intList.delete(0);
          } else {
            tournMatch.setTable(num2++);
          }
        }
      });
    }

    this._currentRound++;
    return true;
  }
}
