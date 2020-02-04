export default class Player {
  static BYE_ID: number = 0;
  static ByePlayer: Player = new Player("*** BYE ***", "", Player.BYE_ID);
  _firstName: string;
  _lastName: string;
  _ID: number;

  constructor(FirstName: string, LastName: string, ID: number) {
    this._firstName = FirstName;
    this._lastName = LastName;
    this._ID = ID;
  }
}
