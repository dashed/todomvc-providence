const chai = require('chai');
const expect = chai.expect;

const Immutable = require('immutable');
const { Map, List } = Immutable;

const immstruct = require('../src/lib/immstruct');
const Structure = immstruct.Structure;
const Providence = require('../src/lib/providence');

describe('immstruct', function() {

    it('should return object that is instanceof Structure and Providence', function() {
        const cursor = immstruct();
        expect(cursor instanceof Structure).to.be.true;
        expect(cursor instanceof Providence).to.be.true;
    });

    it('should create Immutable Map as default root data', function() {
        const cursor = immstruct();
        const rootData = cursor.options().getIn(['root', 'data']);
        expect(rootData).to.have.property('map');
        expect(Map.isMap(rootData.map)).to.be.true;
        expect(cursor instanceof Structure).to.be.true;
        expect(cursor instanceof Providence).to.be.true;
    });

    it('should create Immutable Map from given plain js object', function() {
        const cursor = immstruct({
            foo: {
                bar: {
                    baz: 'qux'
                }
            },
            x: [1, 'a', true, null, void 0, 3.14, { foo: 'bar'}]
        });

        const rootData = cursor.options().getIn(['root', 'data']);

        expect(rootData).to.have.property('map');
        expect(Map.isMap(rootData.map)).to.be.true;
        expect(rootData.map.toJS()).to.eql({
            foo: {
                bar: {
                    baz: 'qux'
                }
            },
            x: [1, 'a', true, null, void 0, 3.14, { foo: 'bar'}]
        });
        expect(cursor instanceof Structure).to.be.true;
        expect(cursor instanceof Providence).to.be.true;
    });

    it('should create Immutable List from given plain js array', function() {
        const cursor = immstruct([1, 'a', true, null, void 0, 3.14, { foo: 'bar'}]);

        const rootData = cursor.options().getIn(['root', 'data']);

        expect(rootData).to.have.property('map');
        expect(List.isList(rootData.map)).to.be.true;
        expect(rootData.map.toJS()).to.eql([1, 'a', true, null, void 0, 3.14, { foo: 'bar'}]);
        expect(cursor instanceof Structure).to.be.true;
        expect(cursor instanceof Providence).to.be.true;
    });

    it('should access updated value from within observe/onUpdate', function() {
        let calls = 0;
        const cursor = immstruct({});

        cursor._options = cursor._options.set('onUpdate', function() {
            expect(cursor.deref().toJS()).to.eql({
                foo: 'bar'
            });
            calls++;
        });

        cursor.observe(function() {
            expect(cursor.deref().toJS()).to.eql({
                foo: 'bar'
            });
            calls++;
        });


        cursor.update((m) => m.set('foo', 'bar'));
        expect(cursor.deref().toJS()).to.eql({
            foo: 'bar'
        });
        expect(calls).to.equal(2);
    });

    it('should observe deleted value from within observe/onUpdate', function() {

        const cursor = immstruct({
            list: []
        });

        let onUpdateCalls = 0;
        cursor._options = cursor._options.set('onUpdate', function() {
            if(onUpdateCalls == 0) {
                expect(cursor.deref().toJS()).to.eql({
                    list: [42]
                });
            }

            if(onUpdateCalls == 1) {
                expect(cursor.deref().toJS()).to.eql({
                    list: []
                });
            }
            onUpdateCalls++;
        });

        let observeCalls = 0;
        cursor.observe(function() {
            if(observeCalls == 0) {
                expect(cursor.deref().toJS()).to.eql({
                    list: [42]
                });
            }

            if(observeCalls == 1) {
                expect(cursor.deref().toJS()).to.eql({
                    list: []
                });
            }
            observeCalls++;
        });


        cursor.cursor('list').update((list) => {
            return list.push(42);
        });

        expect(cursor.deref().toJS()).to.eql({
            list: [42]
        });

        cursor.cursor(['list', 0]).delete();

        expect(cursor.deref().toJS()).to.eql({
            list: []
        });

        expect(onUpdateCalls).to.equal(2);
        expect(observeCalls).to.equal(2);
    });
});
