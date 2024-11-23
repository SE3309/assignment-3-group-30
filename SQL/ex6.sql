-- Insert the most expensive front cosmetic for users with more than 5000 points
INSERT INTO OwnedFrontCosmetic (UserID, FrontCosmeticID)
SELECT u.UserID, fc.FrontCosmeticID
FROM User u
JOIN FrontCosmetic fc 
  ON fc.Cost = (
      SELECT MAX(Cost) 
      FROM FrontCosmetic 
  )
WHERE u.Points > 5000
  AND NOT EXISTS (
      SELECT 1
      FROM OwnedFrontCosmetic ofc
      WHERE ofc.UserID = u.UserID
        AND ofc.FrontCosmeticID = fc.FrontCosmeticID
  )
  AND fc.FrontCosmeticID IS NOT NULL;



-- Update the user's streak to 0 if 7 polls have been posted since they last voted
UPDATE User u
SET u.Streak = 0
WHERE u.UserID NOT IN (
    SELECT DISTINCT s.UserID
    FROM Submission s
    JOIN Poll p ON s.PollID = p.PollID
    WHERE p.PollID IN (
        SELECT PollID
        FROM (
            SELECT PollID
            FROM Poll
            ORDER BY CreationDate DESC
            LIMIT 7
        ) AS LastSevenPolls
    )
)
LIMIT 10000;

-- Delete any comments that have more than 1 reports and haven't been dismisse yet
DELETE FROM CommentReport
WHERE ReportedCommentID IN (
    SELECT ReportedCommentID
    FROM (
        SELECT cr.ReportedCommentID
        FROM CommentReport cr
        WHERE cr.Dismissed = FALSE
        GROUP BY cr.ReportedCommentID
        HAVING COUNT(*) > 1
    ) AS sub
);


