const { expect } = require('chai');
const request = require ('supertest');
const getDb = require('../src/services/db');
const app = require('../src/app');

describe ('read album', () => {
    let db;
    let artists;
    let albums;

    beforeEach(async() => {
        db = await getDb();
        await Promise.all([
            db.query('INSERT INTO Artist (name, genre) VALUES(?, ?)', [
                'Perturbator',
                'electronic',
            ]),
            db.query('INSERT INTO Artist (name, genre) VALUES(?, ?)', [
                'Fever Ray',
                'electronic',
            ]),
                db.query('INSERT INTO Artist (name, genre) VALUES(?, ?)', [
                'Carbon Based Lifeforms',
                'ambient',
            ]),
        ]);
        [artists] = await db.query('SELECT * from Artist');

        await Promise.all([
            db.query('INSERT INTO Album (name, year, artistId) VALUES(?, ?, ?)', [
                'The Uncanny Valley',
                '2016',
                artists[0].id
            ]),
            db.query('INSERT INTO Album (name, year, artistId) VALUES(?, ?, ?)', [
                'Plunge',
                '2017',
                artists[1].id
            ]),
            db.query('INSERT INTO Album (name, year, artistId) VALUES(?, ?, ?)', [
                'Interloper',
                '2010',
                artists[2].id
            ]),
        ]);

        [albums] = await db.query('SELECT * FROM Album');
    });

    afterEach(async () => {
        await db.query('DELETE FROM Artist');
        await db.query('DELETE FROM Album');
        await db.close();
    });

    describe ('/album', () => {
        describe('GET', () => {
            it('returns all album records in the database', async () => {
                const res = await request(app).get('/album').send();
                expect(res.status).to.equal(200);
                expect(res.body.length).to.equal(3);
                res.body.forEach((albumRecord) => {
                    const expected = albums.find((a) => a.id === albumRecord.id);
                    expect(albumRecord).to.deep.equal(expected);
                });
            });
        });
    });

    describe('/album/albumId', () => {
        describe('GET', () => {
            it('returns a single album with the correct id', async () => {
                const expected = albums[0];
                const res = await request(app).get(`/album/${expected.id}`).send();
                expect(res.status).to.equal(200);
                expect(res.body).to.deep.equal(expected);
            });
            it('returns a 404 if the album is not in the database', async () => {
                const res = await request(app).get('/album/999999').send();
                expect(res.status).to.equal(404);
            });
        });
    });
});