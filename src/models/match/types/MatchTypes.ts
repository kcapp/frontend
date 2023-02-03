export class MatchTypes {
  public X01 = 1;
  public SHOOTOUT = 2;
  public X01HANDICAP = 3;
  public CRICKET = 4;
  public DARTS_AT_X = 5;
  public AROUND_THE_WORLD = 6;
  public SHANGHAI = 7;
  public AROUND_THE_CLOCK = 8;
  public TIC_TAC_TOE = 9;
  public BERMUDA_TRIANGLE = 10;
  public FOUR_TWENTY = 11;
  public KILL_BULL = 12;
  public GOTCHA = 13;
  public JDC_PRACTICE = 14;
  public KNOCKOUT = 15;

  public startingScoresX01 = [
    { id: 301, name: "301" },
    { id: 501, name: "501", default: true },
    { id: 701, name: "701" },
  ];

  public startingScoresTicTacToe = [
    { id: 0, name: "+0" },
    { id: 10, name: "+10" },
    { id: 20, name: "+20", default: true },
    { id: 25, name: "+25" },
    { id: 30, name: "+30" },
    { id: 40, name: "+40" },
    { id: 50, name: "+50" },
  ];

  public startingScoresDartsAtX = [
    { id: 20, name: 20, default: true },
    { id: 19, name: 19 },
    { id: 18, name: 18 },
    { id: 17, name: 17 },
    { id: 16, name: 16 },
    { id: 15, name: 15 },
    { id: 14, name: 14 },
    { id: 13, name: 13 },
    { id: 12, name: 12 },
    { id: 11, name: 11 },
    { id: 10, name: 10 },
    { id: 9, name: 9 },
    { id: 8, name: 8 },
    { id: 7, name: 7 },
    { id: 6, name: 6 },
    { id: 5, name: 5 },
    { id: 4, name: 4 },
    { id: 3, name: 3 },
    { id: 2, name: 2 },
    { id: 1, name: 1 },
    { id: 25, name: "Bull" },
  ];

  public startingScoresFourTwenty = [{ id: 420, name: 420, default: true }];

  public startingScoresGotcha = [
    { id: 200, name: "200", default: true },
    { id: 300, name: "300" },
    { id: 500, name: "500" },
  ];

  public startingScoresKillBull = [
    { id: 150, name: "150" },
    { id: 200, name: "200", default: true },
    { id: 250, name: "250" },
    { id: 300, name: "300" },
    { id: 500, name: "500" },
  ];

  public outshotTypes = [
    { id: 1, name: "Double Out", default: true },
    { id: 2, name: "Master Out" },
    { id: 3, name: "Any" },
  ];

  public knockoutLives = [
    { id: 1, name: 1 },
    { id: 3, name: 3 },
    { id: 5, name: 5 },
    { id: 7, name: 7 },
    { id: 10, name: 10 },
  ];

  public matchModes = [];
}
