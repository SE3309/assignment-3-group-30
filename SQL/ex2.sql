-- Tables

CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL
);

DESCRIBE Admin;

CREATE TABLE FrontCosmetic (
	FrontCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);

DESCRIBE FrontCosmetic;

CREATE TABLE MiddleCosmetic (
	MiddleCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);

DESCRIBE MiddleCosmetic;

CREATE TABLE BackCosmetic (
	BackCosmeticID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Cost INT NOT NULL,
    Src VARCHAR(255) NOT NULL
);

DESCRIBE BackCosmetic;

CREATE TABLE User (
	UserID CHAR(7) PRIMARY KEY NOT NULL,
    Username VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    ProfileBio TEXT NOT NULL,
    Points INT DEFAULT 0 NOT NULL,
    LifetimePoints INT DEFAULT 0 NOT NULL,
    Streak INT DEFAULT 0 NOT NULL,
    PredictionAccuracy DOUBLE DEFAULT 0 NOT NULL,
    FrontDisplayed INT NOT NULL,
    MiddleDisplayed INT NOT NULL,
    BackDisplayed INT NOT NULL,
    FOREIGN KEY (FrontDisplayed) REFERENCES FrontCosmetic(FrontCosmeticID) ON UPDATE CASCADE,
    FOREIGN KEY (MiddleDisplayed) REFERENCES MiddleCosmetic(MiddleCosmeticID) ON UPDATE CASCADE,
    FOREIGN KEY (BackDisplayed) REFERENCES BackCosmetic(BackCosmeticID) ON UPDATE CASCADE
);

DESCRIBE User;

CREATE TABLE PointTransaction (
	TransactionID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    TransactionDate DATETIME NOT NULL,
    PointValueDelta INT NOT NULL,
    Reason TEXT, -- Intentionally nullable.
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE PointTransaction;

CREATE TABLE Suggestion (
	Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    OptionA VARCHAR(255) NOT NULL,
    OptionB VARCHAR(255) NOT NULL,
    SuggestionID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    SuggesterID CHAR(7) NOT NULL,
    FOREIGN KEY (SuggesterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE Suggestion;

CREATE TABLE OwnedFrontCosmetic (
	UserID CHAR(7) NOT NULL,
    FrontCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, FrontCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (FrontCosmeticID) REFERENCES FrontCosmetic(FrontCosmeticID) ON UPDATE CASCADE
);

DESCRIBE OwnedFrontCosmetic;

CREATE TABLE OwnedMiddleCosmetic (
	UserID CHAR(7) NOT NULL,
    MiddleCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, MiddleCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (MiddleCosmeticID) REFERENCES MiddleCosmetic(MiddleCosmeticID) ON UPDATE CASCADE
);

DESCRIBE OwnedMiddleCosmetic;

CREATE TABLE OwnedBackCosmetic (
	UserID CHAR(7) NOT NULL,
    BackCosmeticID INT NOT NULL,
    PRIMARY KEY (UserID, BackCosmeticID),
    FOREIGN KEY (UserID) REFERENCES User(UserID),
    FOREIGN KEY (BackCosmeticID) REFERENCES BackCosmetic(BackCosmeticID) ON UPDATE CASCADE
);

DESCRIBE OwnedBackCosmetic;

CREATE TABLE Poll (
	PollID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT NOT NULL,
    OptionA VARCHAR(255) NOT NULL,
    OptionB VARCHAR(255) NOT NULL,
    VotesA INT DEFAULT 0 NOT NULL,
    VotesB INT DEFAULT 0 NOT NULL,
    TotalVotes INT AS (VotesA + VotesB) STORED,
    PercentageVotesA DOUBLE AS (IF(TotalVotes > 0, VotesA / TotalVotes, 0)) STORED,
    PercentageVotesB DOUBLE AS (IF(TotalVotes > 0, VotesB / TotalVotes, 0)) STORED,
    WinningVotes ENUM('A', 'B', 'Tie') AS (
        CASE
            WHEN VotesA > VotesB THEN 'A'
            WHEN VotesB > VotesA THEN 'B'
            ELSE 'Tie'
        END
    ) STORED,
    PredictionsA INT DEFAULT 0 NOT NULL,
    PredictionsB INT DEFAULT 0 NOT NULL,
    TotalPredictions INT AS (PredictionsA + PredictionsB) STORED,
    PercentagePredictionsA DOUBLE AS (IF(TotalPredictions > 0, PredictionsA / TotalPredictions, 0)) STORED,
    PercentagePredictionsB DOUBLE AS (IF(TotalPredictions > 0, PredictionsB / TotalPredictions, 0)) STORED,
    Closed BOOLEAN DEFAULT FALSE NOT NULL,
    CreationDate DATETIME NOT NULL,
    ClosesAt DATETIME NOT NULL,
    SuggestedBy Char(7), -- Intentionally able to be null.
    FOREIGN KEY (SuggestedBy) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE Poll;

CREATE TABLE Submission (
	VoteChoiceA BOOLEAN NOT NULL,
    PredictionChoiceA BOOLEAN NOT NULL,
    TimeSubmitted DATETIME NOT NULL,
    PollID INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    PRIMARY KEY (UserID, PollID),
    FOREIGN KEY (PollID) REFERENCES Poll(PollID),
    FOREIGN KEY (UserID) REFERENCES User(UserID)
);

DESCRIBE Submission;

CREATE TABLE Comment (
	CommentID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Content TEXT NOT NULL,
    PollClosedAtPost BOOLEAN NOT NULL,
    CommentTimeSubmitted DATETIME NOT NULL,
    PollID INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (PollID) REFERENCES Poll(PollID) ON UPDATE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE Comment;

CREATE TABLE Reply (
	ReplyID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    Content TEXT NOT NULL,
    PollClosedAtPost BOOLEAN NOT NULL,
    CommentTimeSubmitted DATETIME NOT NULL,
    ReplyTo INT NOT NULL,
    UserID CHAR(7) NOT NULL,
    FOREIGN KEY (ReplyTo) REFERENCES Comment(CommentID) ON UPDATE CASCADE,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE Reply;

CREATE TABLE CommentReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedCommentID INT NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedCommentID, ReporterID),
    FOREIGN KEY (ReportedCommentID) REFERENCES Comment(CommentID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE CommentReport;

CREATE TABLE UserReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedUserID CHAR(7) NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedUserID, ReporterID),
    FOREIGN KEY (ReportedUserID) REFERENCES User(UserID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE UserReport;

CREATE TABLE ReplyReport(
	Reason TEXT NOT NULL,
    Dismissed BOOLEAN DEFAULT FALSE NOT NULL,
    ReportDate DATETIME NOT NULL,
    ReportedReplyID INT NOT NULL,
    ReporterID CHAR(7) NOT NULL,
    PRIMARY KEY (ReportedReplyID, ReporterID),
    FOREIGN KEY (ReportedReplyID) REFERENCES Reply(ReplyID) ON UPDATE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES User(UserID) ON UPDATE CASCADE
);

DESCRIBE ReplyReport;

-- Triggers

-- Update LifetimePoints when Points are updated
DELIMITER //
CREATE TRIGGER update_lifetime_points
BEFORE UPDATE ON User
FOR EACH ROW
BEGIN
    IF NEW.Points != OLD.Points THEN
        SET NEW.LifetimePoints = OLD.LifetimePoints + (NEW.Points - OLD.Points);
    END IF;
END;
//
DELIMITER ;

-- Update VotesA/Votes after a new Submission
DELIMITER //
CREATE TRIGGER updates_votes_on_poll
AFTER INSERT ON Submission
FOR EACH ROW
BEGIN
    IF NEW.VoteChoiceA = true THEN
        UPDATE Poll
        SET VotesA = VotesA + 1
        WHERE PollID = NEW.PollID;
	END IF;
    IF NEW.VoteChoiceA = false  THEN
        UPDATE Poll
        SET VotesB = VotesB + 1
        WHERE PollID = NEW.PollID;
    END IF;
	IF NEW.PredictionChoiceA = true THEN
		UPDATE Poll
        SET PredictionsA = PredictionsA + 1
        WHERE PollID = NEW.PollID;
	END IF;
	IF NEW.PredictionChoiceA = false THEN
		UPDATE Poll
        SET PredictionsB = PredictionsB + 1
        WHERE PollID = NEW.PollID;
	END IF;
END;
//
DELIMITER
        
-- Update PredictionAccuracy after a Poll Closes
DELIMITER //
CREATE TRIGGER update_prediction_accuracy
AFTER UPDATE ON Poll
FOR EACH ROW
BEGIN
    IF NEW.Closed = TRUE AND OLD.Closed = FALSE THEN
        UPDATE User u
        SET PredictionAccuracy = (
            SELECT 
                IFNULL((SUM(
                    CASE 
                        WHEN ((NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR 
                              (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE))
                             THEN 1 ELSE 0 END) 
                    / COUNT(*)) * 100, 0)
                FROM Submission s
                WHERE s.UserID = u.UserID
                  AND s.PollID = NEW.PollID
            )
        WHERE EXISTS (
            SELECT 1
            FROM Submission s
            WHERE s.PollID = NEW.PollID AND s.UserID = u.UserID
        );
    END IF;
END;
//
DELIMITER ;



-- Update Streak when Poll Closes
DELIMITER //
CREATE TRIGGER update_streak
AFTER UPDATE ON Poll
FOR EACH ROW
BEGIN
    IF NEW.Closed = TRUE AND OLD.Closed = FALSE THEN
        UPDATE User u
        SET Streak = Streak + 1
        WHERE EXISTS (
            SELECT 1
            FROM Submission s
            WHERE s.UserID = u.UserID 
              AND s.PollID = NEW.PollID
              AND (
                  (NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR
                  (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE)
              )
        );

        UPDATE User u
        SET Streak = 0
        WHERE EXISTS (
            SELECT 1
            FROM Submission s
            WHERE s.UserID = u.UserID 
              AND s.PollID = NEW.PollID
              AND NOT (
                  (NEW.WinningVotes = 'A' AND s.PredictionChoiceA = TRUE) OR
                  (NEW.WinningVotes = 'B' AND s.PredictionChoiceA = FALSE)
              )
        );
    END IF;
END;
//
DELIMITER ;
