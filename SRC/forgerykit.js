import { faker } from "@faker-js/faker"

export default class ForgeryKit {
	#connection
	constructor(connection) {
		this.#connection = connection
	}

	insertFrontCosmetic(costMin, costMax) {
		return this.#connection.execute(`-- sql
			INSERT INTO FrontCosmetic (cost, src)
			VALUES (?, ?);
			`, [faker.number.int({min:costMin, max:costMax}), faker.internet.url()])
	}

	end() {
		this.#connection.end()
	}
}

