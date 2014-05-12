jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

describe('a bunch of learning tests', function() {

    describe('simple tests', function() {
        it('should be true', function () {
            expect(true).toBeTruthy();
        });

        it('should be false', function () {
            expect(false).toBeFalsy();
        });

        it('should be true again', function (done) {
            someAsyncPromise().then(function (result) {
                expect(result === 3).toBe(true);
                done();
            });

            function someAsyncPromise() {
                var defer = Q.defer();

                setTimeout(function () {
                    defer.resolve(3);
                }, 500);

                return defer.promise;
            }
        });
    });
    
    describe('learning Jasmine spies', function () {
	    var bar = {
	        foo: function(name) {
	            return 'my name is ' + name;
	        },
	        bas: function(age) {
	            return age;
	        }
	    };

        beforeEach(function() {
            this.foo = jasmine.createSpy('foo');
            spyOn(bar, 'foo').and.returnValue('I am a spy');

        });

        it('real bar.foo is a spy', function () {
            bar.foo.and.callThrough();
            var ret = bar.foo('denis');
            console.log('Return value is ' + ret);
            expect(bar.foo).toHaveBeenCalledWith('denis');
            expect(ret).toMatch(/denis/);
        });

        it('faked bar.foo is a spy', function () {
            var ret = bar.foo('denis');
            console.log('Return value is ' + ret);
            expect(bar.foo).toHaveBeenCalledWith('denis');
            expect(ret).toMatch(/spy/);
        });

        it('foo should be called', function () {
            this.foo(1, 'w');

            expect(this.foo).toHaveBeenCalled();
            console.log('foo should be called');
        });
    });

    describe('learning calling remote service with jQuery ajax', function() {
        it('should call Google currency exchange', function (done) {
            $.ajax({
                url: 'http://rate-exchange.appspot.com/currency?from=USD&to=IDR',
                dataType: 'jsonp',
            })
                .done(function (data) {
                    expect(data).toBeTruthy();
                    console.log(data);
                    done();
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR.responseText);
                    expect(true).toBe(false);
                    done();
                });
        });

        it('should call jQuery $.ajax', function (done) {
            $.ajax('http://localhost:3958/breeze/Breeze/Batches')
                .done(function (data) {
                    console.log('successs');
                    expect(data).toBeTruthy();
                    done();
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log('failed again!!');
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                    expect(true).toBe(false);
                    done();
                });
        });

        it('should return pong', function (done) {
            $.ajax('http://localhost:3958/breeze/Breeze/Ping')
                .done(function (data) {
                    console.log('successs');
                    expect(data).toBe('pong');
                    done();
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log('failed again!!');
                    console.log(jqXHR);
                    console.log(textStatus);
                    console.log(errorThrown);
                    expect(true).toBe(false);
                    done();
                });
        });
    });

    describe('AngularJS $http test', function() {
        var ngHttp;

        beforeEach(inject(function ($http) {
            ngHttp = $http;
        }));

        it('should call AngularJS $http', function (done) {
            ngHttp.get('http://localhost:3958/breeze/Breeze/Batches')
                .success(function (data) {
                    expect(data).toBeTruthy();
                    done();
                }).error(function (error) {
                    console.log(error);
                    expect(true).toBe(false);
                    done();
                });
        });

        it('should call AngularJS $http with JSONP', function (done) {
            ngHttp({
                method: 'JSONP',
                url: 'http://rate-exchange.appspot.com/currency?callback=JSON_CALLBACK&from=USD&to=JPY'
            }).success(function (data, status) {
                console.log('AngularJS $http successs');
                console.log(data);
                console.log(status);
                expect(data).toBeTruthy();
                done();
            }).error(function (data, status) {
                console.log('AngularJS $http failed!!');
                console.log(data);
                console.log(status);
                expect(true).toBe(false);
                done();
            });
        });
        
    });


    //For SO post - http://stackoverflow.com/questions/23597535/breeze-not-populating-entities-from-navigationproperties
    ddescribe('client side metadata by hand', function() {

        var mgr;
        var addType, DATE, DT, helper, ID;
        var serviceName = 'metadataClientSideTest';
        var priorStudyEntityName = 'PriorStudy';
        var patientEntityName = 'Patient';
        var patientResourceName = 'Patients';
        var priorStudyResourceName = 'PriorStudies';

        beforeEach(function() {
            mgr = new breeze.EntityManager(serviceName);
            var store = mgr.metadataStore;
            init(store, serviceName);
            initMetadata();
            createSomeMockData();

            // Initialize the metdataFactory with convenience fns and variables 
            function init(metadataStore, _serviceName) {

                var store = metadataStore; // the metadataStore that we'll be filling

                // namespace of the corresponding classes on the server
                var namespace = 'Model'; // don't really need it here 

                // 'Identity' is the default key generation strategy for this app
                var keyGen = breeze.AutoGeneratedKeyType.Identity;

                // Breeze Labs: breeze.metadata.helper.js
                // https://github.com/IdeaBlade/Breeze/blob/master/Breeze.Client/Scripts/Labs/breeze.metadata-helper.js
                // The helper reduces data entry by applying common conventions
                // and converting common abbreviations (e.g., 'type' -> 'dataType')
                helper = new breeze.config.MetadataHelper(namespace, keyGen);
                helper.addDataService(store, _serviceName);

                // addType - make it easy to add the type to the store using the helper
                addType = function (type) { return helper.addTypeToStore(store, type); };

                // DataTypes we'll be using
                DT = breeze.DataType;
                DATE = DT.DateTime;
                ID = DT.Int32;
            }

            function initMetadata() {
                helper.addTypeToStore(mgr.metadataStore, {
                    name: priorStudyEntityName,
                    dataProperties: {
                        priorStudyId: { type: breeze.DataType.Int32 },
                        patientId: { type: breeze.DataType.Int32 },
                        priorStudyType: { max: 6 },
                        priorStudyPurpose: { max: 12 },
                        notes: { max: 250 }
                    },

                    navigationProperties: {
                        patient: patientEntityName,
                    }
                });

                helper.addTypeToStore(mgr.metadataStore, {
                    name: patientEntityName,
                    dataProperties: {
                        patientId: { type: breeze.DataType.Int32 },
                        firstName: { max: 25 },
                        lastName: { max: 25 },
                    },
                    navigationProperties: {
                        priorStudies: { entityTypeName: priorStudyEntityName, hasMany: true }
                    }
                });
            }

            function createSomeMockData() {
                var patientInits = {
                    patientId: 1,
                    firstName: 'Denis',
                    lastName: 'Koswara',
                };
                var patient = mgr.createEntity(patientEntityName, patientInits);
                
                var priorStudyInits = {
                    priorStudyId: 2,
                    priorStudyType: 'DK',
                    priorStudyPurpose: 'Testing',
                    notes: 'Do not forget',
                };
                var priorStudy = mgr.createEntity(priorStudyEntityName, priorStudyInits);
                patient.priorStudies.push(priorStudy);
                mgr.attachEntity(patient);
                //mgr.attachEntity(priorStudy);
            }

        });

        iit('should defined the following properly', function () {
            var query = breeze.EntityQuery.from('Patients').toType('Patient');

            var results = mgr.executeQueryLocally(query);
            var patient = results[0];
            var priorStudy = patient.priorStudies[0];

            expect(priorStudy).toBeDefined();
            expect(priorStudy.priorStudyId).toEqual(2);
            expect(priorStudy.priorStudyType).toEqual('DK');
            expect(priorStudy.patient.firstName).toEqual('Denis');

        });
    });
});