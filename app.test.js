const app = require("./app")
const supertest = require("supertest")
const request = supertest(app)

describe("/test", () => {
    console.log("SSSSSSSSS");
    it("should return a response", async () => {
        const response = await request.get("/auth/test")
        expect(response.status).toBe(200)
        expect(response.text).toBe("Hello world");
    })
})