import Player from "./Player";
import TournStaff from "./TournStaff";
import InfractionEnum from "./InfractionEnum";
import PenaltyEnum from "./PenaltyEnum";

export default class Penalty {
  Player: Player;
  Judge: TournStaff;
  Infraction: InfractionEnum;
  Penalty: PenaltyEnum;
  Round: number;
  Notes: string;
}
