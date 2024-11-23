-- Find the top 5 polls with the most comments and replies combined
SELECT p.PollID, p.Title, 
       COUNT(DISTINCT c.CommentID) AS TotalComments,
       COUNT(DISTINCT r.ReplyID) AS TotalReplies,
       (COUNT(DISTINCT c.CommentID) + COUNT(DISTINCT r.ReplyID)) AS TotalCommentsAndReplies
FROM Poll p
LEFT JOIN Comment c ON p.PollID = c.PollID
LEFT JOIN Reply r ON c.CommentID = r.ReplyTo
GROUP BY p.PollID, p.Title
ORDER BY TotalCommentsAndReplies DESC
LIMIT 5;

-- Find users who have reported comments more than 1 time and have a prediction accuracy over 25%
SELECT u.UserID, u.Username, u.PredictionAccuracy, COUNT(cr.ReportedCommentID) AS NumReports
FROM User u
JOIN CommentReport cr ON u.UserID = cr.ReporterID
GROUP BY u.UserID, u.Username, u.PredictionAccuracy
HAVING COUNT(cr.ReportedCommentID) > 1 AND u.PredictionAccuracy > 25
ORDER BY NumReports DESC;

-- Show all users who have earned more than 1000 points but have a streak of less than 5
SELECT UserID, Username, Points, Streak
FROM User
WHERE Points > 1000 AND Streak < 5;

-- Find all users who own at least 3 'Front' cosmetics
SELECT u.UserID, u.Username
FROM User u
JOIN OwnedFrontCosmetic ofc ON u.UserID = ofc.UserID
GROUP BY u.UserID, u.Username
HAVING COUNT(ofc.FrontCosmeticID) >= 3;

-- For every user, find their total point transactions and the reason for their single largest transaction
SELECT 
    u.UserID, 
    u.Username, 
    SUM(pt.PointValueDelta) AS TotalPoints,
    ptm.MaxDelta AS LargestTransaction,
    pt.Reason AS ReasonForLargestTransaction
FROM User u
JOIN PointTransaction pt ON u.UserID = pt.UserID
JOIN (
    SELECT UserID, MAX(PointValueDelta) AS MaxDelta
    FROM PointTransaction
    GROUP BY UserID
) ptm ON pt.UserID = ptm.UserID AND pt.PointValueDelta = ptm.MaxDelta
GROUP BY u.UserID, u.Username, ptm.MaxDelta, pt.Reason;

-- Create a single list combining all usernames of users who have suggested polls and who have commented on the polls, avoiding duplicates
SELECT DISTINCT u.Username
FROM User u
JOIN Suggestion s ON u.UserID = s.SuggesterID

UNION

SELECT DISTINCT u.Username
FROM User u
JOIN Comment c ON u.UserID = c.UserID;

-- For each poll, show the title and calcualted column that labels it as "Active" or "Closed" based on the status attribute
SELECT p.PollID, p.Title,
       CASE WHEN p.Closed = False THEN 'Active'
            WHEN p.Closed = True THEN 'Closed'
            ELSE 'Unknown'
       END AS PollStatusLabel
FROM Poll p;
