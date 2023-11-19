const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")

let baseUrl = '/api/v1/customer';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;
let serviceId;

let schema = {
    name: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
    isActive: true, isVerified: true
};


beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Service Module Endpoints <=====', () => {


    it('should register a new customer | endpoint => /api/v1/customer/register', async () => {
        const customerData = generateDummyDataFromSchema(schema)

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(customerData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should authenticate a customer and return a token endpoint => /api/v1/customer/login', async () => {
        const customerCredentials = { email: createdRecordObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(customerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should list services | endpoint => /api/v1/seller/services/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/services/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
        console.log(`response.body`, response.body);
        serviceId = response.body.result[0]._id
    });


    it('should get a specific service | endpoint => /api/v1/seller/services/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/services/get?_id=${serviceId}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/services/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/services/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });

});


afterAll((done) => {
    mongoDB.disconnect(done);
});
