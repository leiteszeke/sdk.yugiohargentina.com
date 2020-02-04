export default class PlayerPoints {
  _playerId: number;
  _opps: Array<number> = new Array<number>();
  POINTSPERMATCH: number = 3;
  POINTSPERTIE: number = 1;
  _draws: number = 0;
  _matches: number = 0;
  _oppDraws: number = 0;
  _oppMatches: number = 0;
  _oppOppDraws: number = 0;
  _oppOppMatches: number = 0;
  _oppOppWins: number = 0;
  _oppWins: number = 0;
  _playoffPoints: number = 0;
  _wins: number = 0;

  constructor(id: number) {
    this._playerId = id;
  }

  playerId() {
    return this._playerId;
  }

  addPlayoffPoints() {
    this._playoffPoints++;
  }

  playoffPoints(): number {
    return this._playoffPoints;
  }

  // Opps List

  addOpp(opp: number) {
    this._opps.push(opp);
  }

  Opps(): Array<number> {
    return this._opps;
  }

  // Points

  OppOppWinPoints(): number {
    return this._oppOppWins * 3 + this._oppOppDraws;
  }

  OppWinPoints(): number {
    return this._oppWins * 3 + this._oppDraws;
  }

  WinPoints(): number {
    return this._wins * 3 + this._draws;
  }

  // Player

  addMatch() {
    this._matches++;
  }

  addWin() {
    this._wins++;
  }

  addDraw() {
    this._draws++;
  }

  wins(): number {
    return this._wins;
  }

  draws(): number {
    return this._draws;
  }

  matches(): number {
    return this._matches;
  }

  // Opps

  sumOppWins(value: number) {
    this._oppWins += value;
  }

  sumOppDraws(value: number) {
    this._oppDraws += value;
  }

  sumOppMatches(value: number) {
    this._oppMatches += value;
  }

  oppWins(): number {
    return this._oppWins;
  }

  oppDraws(): number {
    return this._oppDraws;
  }

  oppMatches(): number {
    return this._oppMatches;
  }

  // Opp Opps

  sumOppOppWins(value: number) {
    this._oppOppWins += value;
  }

  sumOppOppDraws(value: number) {
    this._oppOppDraws += value;
  }

  sumOppOppMatches(value: number) {
    this._oppOppMatches += value;
  }

  oppOppWins(): number {
    return this._oppOppWins;
  }

  oppOppDraws(): number {
    return this._oppOppDraws;
  }

  oppOppMatches(): number {
    return this._oppOppMatches;
  }
}
