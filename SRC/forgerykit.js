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
			`, [faker.number.int({min:costMin, max:costMax}), faker.system.directoryPath()])
	}
	insertMiddleCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO MiddleCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({min:costMin, max:costMax}), faker.system.directoryPath()])
	}
	insertBackCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO BackCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({min:costMin, max:costMax}), faker.system.directoryPath()])
	}

	async getValidCosmetics() {
		const front = this.#connection.execute({
			sql:`-- sql
				SELECT FrontCosmeticID FROM FrontCosmetic;
			`,
			rowsAsArray: true
		})
		const middle = this.#connection.execute({
			sql:`-- sql
				SELECT MiddleCosmeticID FROM MiddleCosmetic;
			`,
			rowsAsArray: true
		})
		const back = this.#connection.execute({
			sql:`-- sql
				SELECT BackCosmeticID FROM BackCosmetic;
			`,
			rowsAsArray: true
		})

		const result = await Promise.all([front, middle, back])

		return {front: result[0][0].flat(), middle: result[1][0].flat(), back: result[2][0].flat()}
	}

	insertUser(validCosmetics) {
		const person = {firstName: faker.person.firstName(), lastName: faker.person.lastName()}
		return this.#connection.execute(`-- sql
			INSERT INTO User (UserID, Username, Email, Password, ProfileBio, FrontDisplayed, MiddleDisplayed, BackDisplayed)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`, [
				randomID(),
				faker.internet.displayName(person), 
				faker.internet.email(person) + " | " + randomID(), 
				faker.internet.password(), 
				faker.person.jobTitle(),
				validCosmetics.front[Math.floor(validCosmetics.front.length * Math.random())],
				validCosmetics.middle[Math.floor(validCosmetics.middle.length * Math.random())],
				validCosmetics.back[Math.floor(validCosmetics.back.length * Math.random())]
			])
	}

	end() {
		this.#connection.end()
	}
}

