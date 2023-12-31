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
let createdShopObject;


let schema = {
    nameEn: 'string',
    nameAr: 'string',
    descriptionEn: "string",
    descriptionAr: "string",
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


describe('=====>Testing Service Module Endpoints <=====', () => {


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
        createdShopObject = response.body.result

    });


    it('should create a new service | endpoint => /api/v1/seller/services/create', async () => {
        let serviceData = generateDummyDataFromSchema(schema)

        let tags = await request(app)
            .get(`${baseUrl}/tags/list`)
            .set(requestHeaders);

        let categories = await request(app)
            .get(`${baseUrl}/categories/list?type=service`)
            .set(requestHeaders);

        let forms = await request(app)
            .get(`${baseUrl}/forms/list`)
            .set(requestHeaders);

        formFields = forms.body.result[0].fields
        formFields = formFields.map((fieldObject) => { return { _id: fieldObject._id, field: fieldObject } })

        tags = tags.body.result.map(fieldObject => fieldObject._id)
        categories = categories.body.result.map(categoryObject => categoryObject._id)

        serviceData.seller = createdSellerObject._id;
        serviceData.shop = createdShopObject._id;
        serviceData.tags = tags;
        serviceData.categories = categories;
        serviceData.fields = formFields

        const response = await request(app)
            .post(`${baseUrl}/services/create`)
            .set(requestHeaders)
            .send(serviceData);

        expect(response.status).toBe(201);
        createdRecordObject = response.body.result

    });


    it('should return an error for duplicate names | endpoint => /api/v1/seller/services/create', async () => {
        let serviceData = generateDummyDataFromSchema(schema)
        serviceData.nameEn = createdRecordObject.nameEn;
        serviceData.nameAr = createdRecordObject.nameAr
        serviceData.seller = createdRecordObject.seller;
        serviceData.shop = createdRecordObject.shop;
        serviceData.tags = createdRecordObject.tags;
        serviceData.categories = createdRecordObject.categories;
        serviceData.fields = createdRecordObject.fields;
        const response = await request(app)
            .post(`${baseUrl}/services/create`)
            .set(requestHeaders)
            .send(serviceData);

        expect(response.status).toBe(409);
    });


    it('should get a specific service | endpoint => /api/v1/seller/services/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/services/get?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should return an error for not found record | endpoint => /api/v1/seller/services/get', async () => {

        const response = await request(app)
            .get(`${baseUrl}/services/get?_id=650b327f77e8313f6966482d`)
            .set(requestHeaders);

        expect(response.status).toBe(404);
    });


    it('should list services | endpoint => /api/v1/seller/services/list', async () => {
        const response = await request(app)
            .get(`${baseUrl}/services/list?seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


    it('should update a service | endpoint => /api/v1/seller/services/update', async () => {

        const response = await request(app)
            .put(`${baseUrl}/services/update?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders)
            .send({ isActive: true });

        expect(response.status).toBe(200);
    });


    it('should delete a service | endpoint => /api/v1/seller/services/remove', async () => {

        const response = await request(app)
            .delete(`${baseUrl}/services/remove?_id=${createdRecordObject._id}&seller=${createdSellerObject._id}`)
            .set(requestHeaders);

        expect(response.status).toBe(200);
    });


});


afterAll((done) => {
    mongoDB.disconnect(done);
});
