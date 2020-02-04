import StaffPosition from "./StaffPosition";

export default class TournStaff {
  _position: StaffPosition;

  public get position(): StaffPosition {
    return this._position;
  }

  public set position(pos: StaffPosition) {
    this._position = pos;
  }

  public getName(): string {
    switch (this._position) {
      case StaffPosition.None:
        return "None";
      case StaffPosition.Organizer:
        return "Organizer";
      case StaffPosition.HeadJudge:
        return "Head Judge";
      case StaffPosition.AssistantHeadJudge:
        return "Assistant Head Judge";
      case StaffPosition.JudgeTeamLead:
        return "Floor Judge - Team Lead";
      case StaffPosition.Judge:
        return "Floor Judge";
      case StaffPosition.Scorekeeper:
        return "Scorekeeper";
      case StaffPosition.EventManager:
        return "Event Manager";
      case StaffPosition.EventStaff:
        return "Event Staff";
      default:
        return "";
    }
  }
}
