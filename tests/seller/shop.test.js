const request = require('supertest');
const app = require('../../configs/app');
const mongoDB = require("../../configs/database");
const { generateDummyDataFromSchema } = require("../../helpers/randomData.helper")
let baseUrl = '/api/v1/seller';
let token
let requestHeaders = {
    'x-app-token': 'Sona3-Team',
    'accept-language': 'en',
    "Authorization": `Bearer ${token}`
};

let createdRecordObject;
let createdSellerObject;


let schema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
    phone: "phone",
    isVerified: true,
    isActive: true
};

let sellerSchema = {
    userName: 'string',
    email: 'email',
    password: '123',
    phone: 'phone',
    address: 'string',
    isActive: true, isVerified: true
};



beforeEach(() => {
    mongoDB.connect();
});


describe('=====>Testing Shop Module Endpoints <=====', () => {


    it('should register a new seller | endpoint => /api/v1/seller/register', async () => {
        const sellerData = generateDummyDataFromSchema(sellerSchema)

        const response = await request(app)
            .post(`${baseUrl}/register`)
            .set(requestHeaders)
            .send(sellerData);

        expect(response.status).toBe(201);
        createdSellerObject = response.body.result

    });


    it('should authenticate a seller and return a token endpoint => /api/v1/seller/login', async () => {
        const sellerCredentials = { email: createdSellerObject.email, password: "123" }
        const response = await request(app)
            .post(`${baseUrl}/login`)
            .set(requestHeaders)
            .send(sellerCredentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        token = response.body.token
        requestHeaders["Authorization"] = `Bearer ${token}`
    });


    it('should create a new shop | endpoint => /api/v1/seller/shops/create', async () => {
        let shopData = generateDummyDataFromSchema(schema)

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=product`)
            .set(requestHeaders);

        seller = createdSellerObject._id
        categories = categories.body.result.map(categoryObject => categoryObject._id)
        shopData.seller = seller
        shopData.categories = categories
        const response = await request(app)
            .post(`${baseUrl}/shops/create`)
            .set(requestHeaders)
            .send(shopData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/shops/create', async () => {
        let shopData = generateDummyDataFromSchema(schema)
        shopData.seller = createdRecordObject.seller
        shopData.categories = createdRecordObject.categories
        shopData.nameEn = createdRecordObject.nameEn;
        shopData.nameAr = createdRecordObject.nameAr
        const response = await request(app)
            .post(`${baseUrl}/shops/create`)
            .set(requestHeaders)
            .send(shopData);

        expect(response.status).toBe(409);
    });


    it('should get a specific shop | endpoint => /api/v1/seller/shops/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/shops/get?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/shops/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/shops/get?_id=650b327f77e8313f6966482d&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list shops | endpoint => /api/v1/seller/shops/list?seller=${createdSellerObject._id}', async () => {
        const response = await request(app)
            .get(`${baseUrl}/shops/list`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a shop | endpoint => /api/v1/seller/shops/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/shops/update?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a shop | endpoint => /api/v1/seller/shops/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/shops/remove?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
