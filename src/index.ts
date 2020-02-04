import Tournament from "./classes/Tournament";
import Player from "./classes/Player";
import TournPlayer from "./classes/TournPlayer";
import TournMatchResult from "./classes/TournMatchResult";
import TournMatch from "./classes/TournMatch";

const players: Array<Player> = [
  new Player("Jugador", "Uno", 123),
  new Player("Jugador", "Dos", 234),
  new Player("Jugador", "Tres", 345),
  new Player("Jugador", "Cuatro", 456)
];

const tournament: Tournament = new Tournament();
const tournPlayers: Array<TournPlayer> = players.map(
  (player: Player) => new TournPlayer(player)
);

tournament.setPlayers(tournPlayers);
tournament.pairNextRound();
tournament.start();

const match1: TournMatch = tournament.currentMatches()[0]
match1.setResult(TournMatchResult.Winner, match1.players()[0].playerId());
const match2: TournMatch = tournament.currentMatches()[1]
match2.setResult(TournMatchResult.Winner, match2.players()[1].playerId());

tournament.pairNextRound();

const match3: TournMatch = tournament.currentMatches()[0]
match3.setResult(TournMatchResult.Winner, match3.players()[0].playerId());
const match4: TournMatch = tournament.currentMatches()[1]
match4.setResult(TournMatchResult.Winner, match4.players()[0].playerId());

tournament.pairNextRound();

const match5: TournMatch = tournament.currentMatches()[0]
match5.setResult(TournMatchResult.Winner, match5.players()[1].playerId());
const match6: TournMatch = tournament.currentMatches()[1]
match6.setResult(TournMatchResult.Winner, match6.players()[1].playerId());

if (!tournament.hasTopCut()) {
  tournament.finish()
  const standings = tournament.getStandings();

  standings.forEach((a) => {
    console.log(`${a.playerId()} => ${a.Tie2_Points()}`);
  })
}