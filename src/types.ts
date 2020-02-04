import TournPlayer from "./classes/TournPlayer";
import TournMatch from "./classes/TournMatch";
import TournMatchResult from "./classes/TournMatchResult";

export type ITournMatch = {
  playoffMatch?: boolean;
  round: number;
  table: number;
  winner?: number;
  status?: TournMatchResult;
  players: Array<TournPlayer>;
};

export type PlayerPoints = {
  PlayerId: number;
  Opps: Array<number>;
  POINTSPERMATCH: number;
  POINTSPERTIE: number;
  Draws: number;
  Matches: number;
  OppDraws: number;
  OppMatches: number;
  OppOppDraws: number;
  OppOppMatches: number;
  OppOppWins: number;
  OppWins: number;
  PlayoffPoints: number;
  Wins: number;
};

export type ITournament = {
  id?: number;
  name?: string;
  location?: Location;
  players?: Array<TournPlayer>;
  matches?: Array<TournMatch>;
}