import Player from "./Player";
import TournPlayer from "./TournPlayer";
import TournMatchResult from "./TournMatchResult";
import { ITournMatch } from "../types";

export default class TournMatch {
  private _playoffMatch: boolean;
  private _round: number;
  private _table: number;
  private _winner: number;
  private _status: TournMatchResult = TournMatchResult.Incomplete;
  private _players: Array<TournPlayer> = Array<TournPlayer>();

  constructor({ players, round, table, playoffMatch, winner, status }: ITournMatch) {
    this._players = players;
    this._round = round;
    this._table = table;
    this._playoffMatch = playoffMatch || false;
    this._winner = winner || 0;
    this._status = status || TournMatchResult.Incomplete;

    if (winner) {
      this._status = TournMatchResult.Winner;
    }
  }

  HasPlayer(PlayerId: number): boolean {
    if (this._players.find(p => p.playerId() === PlayerId)) {
      return true;
    }

    return false;
  }

  GetByPlayer(PlayerId: number): TournMatch | null {
    if (this.HasPlayer(PlayerId)) {
      return this;
    }

    return null;
  }

  GetOpponentId(playerId: number): number {
    const player: TournPlayer | undefined = this._players.find(
      p => p.playerId() !== playerId
    );

    if (player) {
      return player.playerId();
    }

    return Player.BYE_ID;
  }

  players(): Array<TournPlayer> {
    return this._players;
  }

  round(): number {
    return this._round;
  }

  table(): number {
    return this._table;
  }

  status(): TournMatchResult {
    return this._status;
  }

  winner(): number {
    return this._winner;
  }

  setResult(result: TournMatchResult, playerId: number) {
    this._winner = playerId;
    this._status = result;
  }

  setTable(value: number) {
    this._table = value;
  }

  isCompleted(): boolean {
    return this._status !== TournMatchResult.Incomplete;
  }
}
