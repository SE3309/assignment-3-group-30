-- Insert a reply from a random user into the longest comment chain for a specific PollID
INSERT INTO Reply (ReplyTo, UserID, Content, PollClosedAtPost, CommentTimeSubmitted)
SELECT 
    c.CommentID, 
    (SELECT UserID FROM User ORDER BY RAND() LIMIT 1), 
    'example comment',  
    p.Closed,          
    NOW()
FROM Comment c
LEFT JOIN Reply r ON c.CommentID = r.ReplyTo
JOIN Poll p ON c.PollID = p.PollID
WHERE c.PollID = '2'
GROUP BY c.CommentID
ORDER BY COUNT(r.ReplyID) DESC
LIMIT 1;

-- Insert submissions for eligible users with over 8000 points or a streak above 450

CREATE TEMPORARY TABLE TempSubmission (
    UserID CHAR(7),
    PollID INT,
    VoteChoiceA BOOLEAN,
    PredictionChoiceA BOOLEAN,
    TimeSubmitted DATETIME
);
INSERT INTO TempSubmission (UserID, PollID, VoteChoiceA, PredictionChoiceA, TimeSubmitted)
SELECT 
    u.UserID, 
    p.PollID, 
    CASE WHEN u.Points > 8000 THEN TRUE ELSE FALSE END,  
    CASE WHEN u.Points > 8000 THEN TRUE ELSE FALSE END, 
    NOW()
FROM Poll p
JOIN User u ON p.Closed = false
WHERE u.Points > 8000 OR u.Streak > 450;

INSERT IGNORE INTO Submission (UserID, PollID, VoteChoiceA, PredictionChoiceA, TimeSubmitted)
SELECT ts.UserID, ts.PollID, ts.VoteChoiceA, ts.PredictionChoiceA, ts.TimeSubmitted
FROM TempSubmission ts
WHERE NOT EXISTS (
    SELECT 1 
    FROM Submission s 
    WHERE s.UserID = ts.UserID AND s.PollID = ts.PollID
);

DROP TABLE TempSubmission;

-- Insert poll from a suggestion made by the user with the highest streak (among those who made suggestions)
INSERT INTO Poll (Title, Description, OptionA, OptionB, CreationDate, ClosesAt, SuggestedBy)
SELECT 
    s.Title, 
    s.Description, 
    s.OptionA, 
    s.OptionB, 
    NOW(), 
    NOW() + INTERVAL 7 DAY, 
    s.SuggesterID
FROM Suggestion s
JOIN User u ON s.SuggesterID = u.UserID
WHERE u.UserID = (
    SELECT SuggesterID
    FROM Suggestion s_inner
    JOIN User u_inner ON s_inner.SuggesterID = u_inner.UserID
    ORDER BY u_inner.Streak DESC
    LIMIT 1
)
ORDER BY s.SuggestionID ASC
LIMIT 1;

