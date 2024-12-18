import { faker } from "@faker-js/faker"
import { randomID } from "./util.js"

export default class ForgeryKit {
	/** @type {import('mysql2/promise').Connection} */
	#connection
	constructor(connection) {
		this.#connection = connection
	}

	insertFrontCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO FrontCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({ min: costMin, max: costMax }), faker.system.directoryPath()])
	}
	insertMiddleCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO MiddleCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({ min: costMin, max: costMax }), faker.system.directoryPath()])
	}
	insertBackCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO BackCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({ min: costMin, max: costMax }), faker.system.directoryPath()])
	}

	insertUser(validCosmetics) {
		const person = { firstName: faker.person.firstName(), lastName: faker.person.lastName() }
		return this.#connection.execute(`-- sql
			INSERT INTO User (UserID, Username, Email, Password, ProfileBio, Points, LifetimePoints, Streak, PredictionAccuracy, FrontDisplayed, MiddleDisplayed, BackDisplayed)
        	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        	`, [
			randomID(),
			faker.internet.displayName(person),
			faker.internet.email(person) + " | " + randomID(),
			faker.internet.password(),
			faker.person.jobTitle(),
			faker.number.int({ min: 0, max: 10000 }),
			faker.number.int({ min: 0, max: 10000 }),
			faker.number.int({ min: 0, max: 500 }),
			faker.number.int({ min: 0, max: 100}),
			validCosmetics.front[Math.floor(validCosmetics.front.length * Math.random())],
			validCosmetics.middle[Math.floor(validCosmetics.middle.length * Math.random())],
			validCosmetics.back[Math.floor(validCosmetics.back.length * Math.random())]
		]);
	}

	async insertFrontCosmeticPurchase(userID, cosmeticID) {
		await this.#connection.beginTransaction()
		const [cost] = await this.#connection.execute(`-- sql
				SELECT Cost FROM FrontCosmetic WHERE FrontCosmeticID = ?;`,
			[cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO OwnedFrontCosmetic (UserID, FrontCosmeticID) VALUES (?, ?);`,
			[userID, cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO PointTransaction (Reason, UserID, PointValueDelta, TransactionDate)
				VALUES ("Purchased Cosmetic", ?, (-1 * ?), NOW());`,
			[userID, cost[0].Cost])
		await this.#connection.commit()
	}
	async insertMiddleCosmeticPurchase(userID, cosmeticID) {
		await this.#connection.beginTransaction()
		const [cost] = await this.#connection.execute(`-- sql
				SELECT Cost FROM MiddleCosmetic WHERE MiddleCosmeticID = ?;`,
			[cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO OwnedMiddleCosmetic (UserID, MiddleCosmeticID) VALUES (?, ?);`,
			[userID, cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO PointTransaction (Reason, UserID, PointValueDelta, TransactionDate)
				VALUES ("Purchased Cosmetic", ?, (-1 * ?), NOW());`,
			[userID, cost[0].Cost])
		await this.#connection.commit()
	}
	async insertBackCosmeticPurchase(userID, cosmeticID) {
		await this.#connection.beginTransaction()
		const [cost] = await this.#connection.execute(`-- sql
				SELECT Cost FROM BackCosmetic WHERE BackCosmeticID = ?;`,
			[cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO OwnedBackCosmetic (UserID, BackCosmeticID) VALUES (?, ?);`,
			[userID, cosmeticID])
		await this.#connection.execute(`-- sql
				INSERT INTO PointTransaction (Reason, UserID, PointValueDelta, TransactionDate)
				VALUES ("Purchased Cosmetic", ?, (-1 * ?), NOW());`,
			[userID, cost[0].Cost])
		await this.#connection.commit()
	}

	insertPoll() {
		return this.#connection.execute(`-- sql
			INSERT INTO Poll (Title, Description, OptionA, OptionB, CreationDate, ClosesAt)
			VALUES (?, ?, ?, ?, ?, ?);
			`, [faker.lorem.words(5) + "?", faker.lorem.words(10), faker.lorem.words(2), faker.lorem.words(2), faker.date.past(), faker.date.future()])
	}
	insertPollWithSuggester(userID) {
		return this.#connection.execute(`-- sql
			INSERT INTO Poll (Title, Description, OptionA, OptionB, CreationDate, ClosesAt, SuggestedBy)
			VALUES (?, ?, ?, ?, ?, ?, ?);
			`, [faker.lorem.words(5) + "?", faker.lorem.words(10), faker.lorem.words(2), faker.lorem.words(2), faker.date.past(), faker.date.future(), userID])
	}

	insertSubmission(voteSplit, predictionSplit, poll, validUsers) {
		const user = validUsers[Math.floor(validUsers.length * Math.random())]

		const vote = Math.random() < voteSplit
		const prediction = Math.random() < predictionSplit

		return this.#connection.execute(`-- sql
			INSERT INTO Submission (VoteChoiceA, PredictionChoiceA, TimeSubmitted, PollID, UserID)
			VALUES (?, ?, ?, ?, ?);
			`, [vote, prediction, faker.date.recent(), poll, user])
	}

	insertComment(validUsers, validPolls, pollClosed) {
		const user = validUsers[Math.floor(validUsers.length * Math.random())]
		const poll = validPolls[Math.floor(validPolls.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO Comment (Content, PollClosedAtPost, PollID, UserID, CommentTimeSubmitted)
			VALUES (?, ?, ?, ?, ?);
			`, [faker.lorem.words({ min: 10, max: 60 }), pollClosed, poll, user, faker.date.recent()])
	}
	insertReply(validUsers, validComments, pollClosed) {
		const user = validUsers[Math.floor(validUsers.length * Math.random())]
		const comment = validComments[Math.floor(validComments.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO Reply (Content, PollClosedAtPost, CommentTimeSubmitted, ReplyTo, UserID)
			VALUES (?, ?, ?, ?, ?);
			`, [faker.lorem.words({ min: 10, max: 60 }), pollClosed, faker.date.recent(), comment, user])
	}

	insertSuggestion(validUsers, dismissed) {
		const user = validUsers[Math.floor(validUsers.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO Suggestion (Title, Description, OptionA, OptionB, Dismissed, SuggesterID)
			VALUES (?, ?, ?, ?, ?, ?);
			`, [faker.lorem.words(5) + "?", faker.lorem.words(10), faker.lorem.words(2), faker.lorem.words(2), dismissed, user])
	}

	insertAdmin() {
		return this.#connection.execute(`-- sql
			INSERT INTO Admin (Email, Password)
			VALUES (?, ?);
			`, [faker.internet.email(), faker.internet.password()])
	}

	insertUserReport(validUsers, dismissed) {
		const user = validUsers[Math.floor(validUsers.length * Math.random())]
		const reporter = validUsers[Math.floor(validUsers.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO UserReport (Reason, Dismissed, ReportDate, ReportedUserID, ReporterID)
			VALUES (?, ?, ?, ?, ?);
			`, [faker.lorem.words(10), dismissed, faker.date.recent(), user, reporter])
	}
	insertCommentReport(validComments, validUsers, dismissed) {
		const comment = validComments[Math.floor(validComments.length * Math.random())]
		const reporter = validUsers[Math.floor(validUsers.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO CommentReport (Reason, Dismissed, ReportDate, ReportedCommentID, ReporterID)
			VALUES (?, ?, ?, ?, ?);
			`, [faker.lorem.words(10), dismissed, faker.date.recent(), comment, reporter])
	}
	insertReplyReport(validReplies, validUsers, dismissed) {
		const reply = validReplies[Math.floor(validReplies.length * Math.random())]
		const reporter = validUsers[Math.floor(validUsers.length * Math.random())]

		return this.#connection.execute(`-- sql
			INSERT INTO ReplyReport (Reason, Dismissed, ReportDate, ReportedReplyID, ReporterID)
			VALUES (?, ?, ?, ?, ?);
			`, [faker.lorem.words(10), dismissed, faker.date.recent(), reply, reporter])
	}

	async getValidCosmetics() {
		const front = this.#connection.execute({
			sql: `-- sql
				SELECT FrontCosmeticID FROM FrontCosmetic;
			`,
			rowsAsArray: true
		})
		const middle = this.#connection.execute({
			sql: `-- sql
				SELECT MiddleCosmeticID FROM MiddleCosmetic;
			`,
			rowsAsArray: true
		})
		const back = this.#connection.execute({
			sql: `-- sql
				SELECT BackCosmeticID FROM BackCosmetic;
			`,
			rowsAsArray: true
		})

		const result = await Promise.all([front, middle, back])

		return { front: result[0][0].flat(), middle: result[1][0].flat(), back: result[2][0].flat() }
	}

	async getValidUserIDs() {
		return (await this.#connection.execute({
			sql: `-- sql
				SELECT UserID FROM User;
			`,
			rowsAsArray: true
		}))[0].flat()
	}

	async getValidPollIDs() {
		return (await this.#connection.execute({
			sql: `-- sql
				SELECT PollID FROM Poll;
			`,
			rowsAsArray: true
		}))[0].flat()
	}

	async getValidCommentIDs() {
		return (await this.#connection.execute({
			sql: `-- sql
				SELECT CommentID FROM Comment;
			`,
			rowsAsArray: true
		}))[0].flat()
	}

	async getValidReplyIDs() {
		return (await this.#connection.execute({
			sql: `-- sql
				SELECT ReplyID FROM Reply;
			`,
			rowsAsArray: true
		}))[0].flat()
	}

	end() {
		this.#connection.end()
	}
}

