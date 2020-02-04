import CutType from "./CutType";
import Player from "./Player";

export default class TournPlayer {
  static TIE_SPACES: number = 5;
  private _assignedSeat: number = -1;
  private _player: Player;
  private _notes?: string;
  private _dropReason?: CutType;
  private _dropRound?: number;
  private _matchCount?: number;
  private _openDuelingPoints?: number;
  private _playoffPoints: number = 0;
  private _rank: number = 0;
  private _tie1: number = 0;
  private _tie2: number = 0;
  private _tie3: number = 0;
  private _tie4: number = 0;

  constructor(player: Player) {
    this._player = player;
    this._dropRound = 0;
    this._dropReason = CutType.Active;
  }

  player(): Player {
    return this._player;
  }

  playerId(): number {
    return this._player._ID;
  }

  playoffPoints(): number {
    return this._playoffPoints;
  }

  setPlayoffPoints(value: number) {
    this._playoffPoints = value;
  }

  rank(): number {
    return this._rank;
  }

  assignedSeat(): number {
    return this._assignedSeat
  }

  setTie1_Wins(value: number) {
    this._tie1 = value;
  }

  Tie1_Wins(): number {
    return this._tie1;
  }

  setTie2_Points(value: number) {
    this._tie2 = value;
  }

  Tie2_Points(): number {
    return this._tie2;
  }

  clearTies() {
    this.setTie1_Wins(0);
    this.setTie2_Points(0);
    this._matchCount = 0;
    this._playoffPoints = 0;
  }

  isActive(): boolean {
    return this._dropRound === 0 || this._dropReason === CutType.Active;
  }
}
