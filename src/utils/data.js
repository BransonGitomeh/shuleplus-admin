import emitize from "./emitize";
import { query, mutate } from "./requests";

const studentsData = [];
const parentsData = [];
const busesData = [];
const driversData = [];
const routesData = [];
const complaintsData = []
const tripsData = [];
const schedulesData = [];
const classesData = [];
const teachersData = [];

var Data = (function () {
  var instance;

  // local variables to keep a cache of every entity
  var students = studentsData;
  var parents = parentsData;
  var drivers = driversData;
  var buses = busesData;
  var routes = routesData;
  var schedules = schedulesData;
  var trips = tripsData;
  var complaints = complaintsData;
  var classes = classesData;
  var teachers = teachersData;

  // subscriptions for every entity to keep track of everyone subscribing to any data
  var subs = {};
  emitize(subs, "students");
  emitize(subs, "parents");
  emitize(subs, "drivers");
  emitize(subs, "buses");
  emitize(subs, "routes");
  emitize(subs, "schedules");
  emitize(subs, "trips");
  emitize(subs, "complaints");
  emitize(subs, "classes");
  emitize(subs, "teachers");

  // subs.students = log; //subscribe to events (named 'x') with cb (log)
  // //another subscription won't override the previous one
  // subs.students = logPlus1;
  // subs.students(9); //emits '9' to all listeners;

  // when the data store gets innitialized, fetch all data and store in cache
  const init = () => {
    query(`{
      schools{
        complaints{
          id
          time
          content
          parent{
            id,
            name
          }
        }
        students {
          id
          names
          gender
          registration
          class{
            name,
            teacher{
              name
            }
          }
          route {
            id,
            name
          }
          parent {
            id,
            national_id,
            name
          }
          parent2 {
            id,
            national_id,
            name
          }
        }
        buses {
          id,
          plate
          make
          size
          driver{
            username
          }
        }
        drivers {
          id
          username
          email
          phone
          license_expiry
          licence_number
          home
        }
        parents {
          id
          national_id
          name
          gender
          email
          phone
          students {
            names
            gender
            route {
              name
            }
          }
        }
        teachers{
          id
          national_id
          name
          gender
          phone
          email
          classes{
            name
          }
        }
        classes {
          id
          name
          students {
            names
            gender
            route {
              name
            }
          }
          teacher{
            id,
            name
          }
        }
        routes {
          id
          name
          description
          path {
            lat
            lng
          }
        }
        schedules {
          id
          time
          end_time
          name
          days
          route {
            id,
            name
          },
          bus{
            id
            make
          }
        },
        trips {
          id
          driver{
            id
            username
          }
          schedule {
            name
            id
            time
            end_time,
            route{
              id,
              name
              students{
                id
              }
            }
          }
          startedAt,
          isCancelled
          completedAt
          bus{
            id,
            make,
            plate
          }
          driver{
            id,
            username
          }
          locReports{
            id
            time
            loc{
              lat
              lng
            }
          }
          events{
            time,
            type,
            student{
              id,
              names
            }
          }
        }
    }
  }`).then(response => {
      console.log(response)
      // let { students } = response
      let { schools } = response

      let school = schools[0]

      students = school.students.map(student => {

        if (student.parent) {
          student.parent_name = student.parent.name;
        }

        if (student.parent2) {
          student.parent2_name = student.parent2.name;
        }

        if (student.route) {
          student.route_name = student.route.name;
        }

        if (student.class) {
          student.class_name = student.class.name;
        }

        return student;
      });

      subs.students({ students });

      buses = school.buses.map(bus => ({ ...bus, driver: bus.driver ? bus.driver.username : "" }));
      subs.buses({ buses });

      parents = school.parents;
      subs.parents({ parents });

      teachers = school.teachers
      subs.teachers({ teachers });

      console.log({ school })
      classes = school.classes.map(Iclass => ({ ...Iclass, student_num: Iclass.students.length || 0, teacher_name: Iclass.teacher?.name }));
      subs.classes({ classes });

      routes = school.routes;
      subs.routes({ routes });

      drivers = school.drivers;
      subs.drivers({ drivers });

      schedules = school.schedules.map(schedule => {
        if (schedule.bus)
          schedule.bus_make = schedule.bus?.make

        if (schedule.route)
          schedule.route_name = schedule.route?.name

        return schedule
      });
      subs.schedules({ schedules });

      trips = school.trips;
      subs.trips({ trips });

      complaints = school.complaints;
      subs.complaints({ complaints });
    });
  }

  if (localStorage.getItem('authorization'))
    init()


  function createInstance() {
    // eslint-disable-next-line no-new-object
    var object = new Object("Instance here");
    return object;
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
    init,
    comms: {
      send: ({ type, parents, message }) => new Promise(async (resolve, reject) => {
        resolve('ok')
      })
    },
    auth: {
      login(id) {
        return {};
      },
      getUser(id) {
        return {};
      },
      logout(id, data) {
        return;
      }
    },
    students: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { students: { create: { id } } } = await mutate(
            `
          mutation ($Istudent: Istudent!) {
            students {
              create(student: $Istudent) {
                id
              }
            }
          }`,
            {
              Istudent: data
            }
          );

          data.id = id;

          data.parent = parents.filter(p => p.id == data.parent)[0];
          data.parent_name = data.parent?.name

          data.parent2 = parents.filter(p => p.id == data.parent2)[0];
          data.parent2_name = data.parent2?.name

          data.route = routes.filter(p => p.id == data.route)[0];
          data.route_name = data.route?.name

          data.class = classes.filter(p => p.id == data.class)[0];
          data.class_name = data.class?.name

          students = [...students, data];
          subs.students({ students });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($student: Ustudent!) {
            students {
              update(student: $student) {
                id
              }
            }
          } `,
            {
              student: Object.assign({}, data, {
                parent_name: undefined,
                parent2_name: undefined,
                class: data.class.id,
                class_name: undefined,
                parent: data.parent.id,
                parent2: data.parent2.id,
                route_name: undefined,
                route: data.route.id
              })
            }
          );

          const subtract = students.filter(({ id }) => id !== data.id);
          students = [data, ...subtract];
          subs.students({ students });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Istudent: Ustudent!) {
            students {
              archive(student: $Istudent) {
                id
              }
            }
          }  `,
            {
              Istudent: {
                id: data.id
              }
            }
          );

          const subtract = students.filter(({ id }) => id !== data.id);
          students = [...subtract];
          subs.students({ students });
          resolve();
        }),
      list() {
        return students;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.students = cb;
        return students;
      },
      getOne(id) { }
    },
    parents: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
          mutation ($Iparent: Iparent!) {
            parents {
              create(parent: $Iparent) {
                id
              }
            }
          }`,
            {
              Iparent: data
            }
          );

          data.id = id;

          parents = [...parents, data];
          subs.parents({ parents });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($parent: Uparent!) {
            parents {
              update(parent: $parent) {
                id
              }
            }
          }`,
            {
              parent: data
            }
          );

          const subtract = parents.filter(({ id }) => id !== data.id);
          parents = [data, ...subtract];
          subs.parents({ parents });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
          mutation ($Iparent: Uparent!) {
            parents {
              archive(parent: $Iparent) {
                id
              }
            }
          } `,
            {
              Iparent: {
                id: data.id
              }
            }
          );

          const subtract = parents.filter(({ id }) => id !== data.id);
          parents = [...subtract];
          subs.parents({ parents });
          resolve();
        }),
      list() {
        return parents;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.parents = cb;
        return parents;
      },
      getOne(id) { }
    },
    teachers: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
          mutation ($Iteacher: Iteacher!) {
            teachers {
              create(teacher: $Iteacher) {
                id
              }
            }
          }`,
            {
              Iteacher: data
            }
          );

          data.id = id;

          teachers = [...teachers, data];
          subs.teachers({ teachers });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($teacher: Uteacher!) {
            teachers {
              update(techer: $teacher) {
                id
              }
            }
          }`,
            {
              teacher: data
            }
          );

          const subtract = teachers.filter(({ id }) => id !== data.id);
          teachers = [data, ...subtract];
          subs.teachers({ teachers });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
          mutation ($Iteacher: Uteacher!) {
            teachers {
              archive(teacher: $Iteacher) {
                id
              }
            }
          } `,
            {
              Iteacher: {
                id: data.id
              }
            }
          );

          const subtract = teachers.filter(({ id }) => id !== data.id);
          teachers = [...subtract];
          subs.teachers({ teachers });
          resolve();
        }),
      list() {
        return teachers;
      },
      subscribe(cb) {
        // listen for even change on the teachers observables
        subs.teachers = cb;
        return teachers;
      },
      getOne(id) { }
    },
    classes: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
          mutation ($Iclass: IClass!) {
            classes {
              create(class: $Iclass) {
                id
              }
            }
          }`,
            {
              Iclass: data
            }
          );

          data.id = id;
          data.teacher_name = teachers.find(t => t.id === data.teacher)?.name
          data.student_num = 0

          classes = [...classes, data];
          subs.classes({ classes });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Iclass: UClass!) {
            classes {
              update(class: $Iclass) {
                id
              }
            }
          }`,
            {
              Iclass: Object.assign({}, { id: data.id, name: data.name })
            }
          );

          const subtract = classes.filter(({ id }) => id !== data.id);
          classes = [data, ...subtract];
          subs.classes({ classes });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
          mutation ($Iclass: UClass!) {
            classes {
              archive(class: $Iclass) {
                id
              }
            }
          } `,
            {
              Iclass: {
                id: data.id
              }
            }
          );

          const subtract = classes.filter(({ id }) => id !== data.id);
          classes = [...subtract];
          subs.classes({ classes });
          resolve();
        }),
      list() {
        return classes;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.classes = cb;
        return classes;
      },
      getOne(id) { }
    },
    drivers: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
            mutation ($Idriver: Idriver!) {
              drivers {
                create(driver: $Idriver) {
                  id
                }
              }
            }`,
            {
              Idriver: data
            }
          );

          const { id } = res.drivers.create
          data.id = id;

          drivers = [...drivers, data];
          subs.drivers({ drivers });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($driver: Udriver!) {
            drivers {
              update(driver: $driver) {
                id
              }
            }
          } 
          `,
            {
              driver: data
            }
          );

          const subtract = drivers.filter(({ id }) => id !== data.id);
          drivers = [data, ...subtract];
          subs.drivers({ drivers });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Idriver: Udriver!) {
            drivers {
              archive(driver: $Idriver) {
                id
              }
            }
          } 
          `,
            {
              Idriver: {
                id: data.id
              }
            }
          );

          const subtract = drivers.filter(({ id }) => id !== data.id);
          drivers = [...subtract];
          subs.drivers({ drivers });
          resolve();
        }),
      list() {
        return drivers;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.drivers = cb;
        return drivers;
      },
      getOne(id) { }
    },
    buses: {
      create: bus =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `mutation ($bus: Ibus!) {
            buses {
              create(bus: $bus) {
                id
              }
            }
          }`,
            {
              bus
            }
          );

          bus.id = id;
          buses = [...buses, bus];
          subs.buses({ buses });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($bus: Ubus!) {
            buses {
              update(bus: $bus) {
                id
              }
            }
          }`,
            {
              bus: data
            }
          );

          const subtract = buses.filter(({ id }) => id !== data.id);
          buses = [data, ...subtract];
          subs.buses({ buses });
          resolve();
        }),
      delete: bus =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Ibus: Ubus!) {
            buses {
              archive(bus: $Ibus) {
                id
              }
            }
          }  `,
            {
              Ibus: {
                id: bus.id
              }
            }
          );

          const subtract = buses.filter(({ id }) => id !== bus.id);
          buses = [...subtract];
          subs.buses({ buses });
          resolve();
        }),
      list() {
        return buses;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.buses = cb;
        return buses;
      },
      getOne(id) { }
    },
    trips: {
      list() {
        return trips;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.trips = cb;
        return trips;
      },
      getOne: id => {
        const trip = trips.find(trip => trip.id === id)
        return trip
      },
      delete: trip =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Itrip: Utrip!) {
            trips {
              archive(trip: $Itrip) {
                id
              }
            }
          }  `,
            {
              Itrip: {
                id: trip.id
              }
            }
          );

          const subtract = trips.filter(({ id }) => id !== trip.id);
          trips = [...subtract];
          subs.trips({ trips });
          resolve();
        }),
    },
    complaints: {
      list() {
        return complaints;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.complaints = cb;
        return complaints;
      },
      delete: complaint =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Icomplaint: Ucomplaint!) {
            complaints {
              archive(complaint: $Icomplaint) {
                id
              }
            }
          }  `,
            {
              Icomplaint: {
                id: complaint.id
              }
            }
          );

          const subtract = complaints.filter(({ id }) => id !== complaint.id);
          complaints = [...subtract];
          subs.complaints({ complaints });
          resolve();
        }),
      getOne(id) { }
    },
    routes: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
            mutation ($Iroute: Iroute!) {
              routes {
                create(route: $Iroute) {
                  id
                }
              }
            }`,
            {
              Iroute: data
            }
          );

          data.id = id;
          routes = [...routes, data];
          subs.routes({ routes });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($route: Uroute!) {
            routes {
              update(route: $route) {
                id
              }
            }
          } `,
            {
              route: {
                id: data.id,
                name: data.name,
                description: data.description
              }
            }
          );

          const subtract = routes.filter(({ id }) => id !== data.id);
          routes = [data, ...subtract];
          subs.routes({ routes });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Iroute: Uroute!) {
            routes {
              archive(route: $Iroute) {
                id
              }
            }
          }`,
            {
              Iroute: {
                id: data.id
              }
            }
          );

          const subtract = routes.filter(({ id }) => id !== data.id);
          routes = [...subtract];
          subs.routes({ routes });
          resolve();
        }),
      list() {
        return routes;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.routes = cb;
        return routes;
      },
      getOne(id) { }
    },
    schedules: {
      create: schedule =>
        new Promise(async (resolve, reject) => {
          schedule.days = schedule.days.join(",");

          if (schedule.route) {
            schedule.route_name = undefined
          }

          if (schedule.bus) {
            schedule.bus_make = undefined
          }

          const res = await mutate(
            `
          mutation ($schedule: Ischedule!) {
            schedules {
              create(schedule: $schedule) {
                id
              }
            }
          }            
        `,
            {
              schedule
            }
          );

          const { id } = res

          schedule.id = id;
          schedule.days = schedule.days.split(",");

          schedule.route = routes.filter(
            route => route.id === schedule.route
          )[0];

          schedule.bus = buses.filter(bus => bus.id === schedule.bus)[0];
          schedule.bus_make = schedule.bus.make


          schedules = [...schedules, schedule];
          subs.schedules({ schedules });
          resolve();
        }),
      update: schedule =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Uschedule: Uschedule!) {
            schedules {
              update(schedule: $Uschedule) {
                id
              }
            }
          }            
        `,
            {
              Uschedule: Object.assign({}, schedule, {
                bus_make: undefined,
                route_name: undefined,
                buses: undefined,
                routes: undefined,
                selectedDays: undefined,
                bus: schedule.bus.id,
                route: schedule.route.id
              })
            }
          );

          const subtract = schedules.filter(({ id }) => id !== schedule.id);
          schedule.bus_make = schedule.bus.make
          schedule.route_name = schedule.route.name
          schedule.days = schedule.days.split(',')

          schedules = [schedule, ...subtract];
          subs.schedules({ schedules });
          resolve();
        }),
      delete: schedule =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Ischedule: Uschedule!) {
            schedules {
              archive(schedule: $Ischedule) {
                id
              }
            }
          }                  
        `,
            {
              Ischedule: {
                id: schedule.id
              }
            }
          );

          const subtract = schedules.filter(({ id }) => id !== schedule.id);
          schedules = [...subtract];
          subs.schedules({ schedules });
          resolve();
        }),
      list() {
        return schedules;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.schedules = cb;
        return schedules;
      },
      getOne(id) { }
    },
    picksAndDrops: {
      create(id) {
        return {};
      },
      update(id, data) {
        return;
      },
      delete(id) {
        return;
      },
      list() {
        return [];
      },
      getOne(id) { }
    },
    messages: {
      create(id) {
        return {};
      },
      update(id, data) {
        return;
      },
      delete(id) {
        return;
      },
      list() {
        return [];
      },
      getOne(id) { }
    },
    communication: {
      sms: {
        create: sms => new Promise(async (resolve, reject) => {
          const res = await mutate(`
          mutation($sms : Isms!){
            sms{
              send(sms: $sms)
            }
          }
          `, {
            sms
          })

          resolve(res)
        }),
        update(id, data) {
          return;
        },
        delete(id) {
          return;
        },
        list() {
          return [];
        },
        getOne(id) { }
      },
      email: {
        create(id) {
          return {};
        },
        update(id, data) {
          return;
        },
        delete(id) {
          return;
        },
        list() {
          return [];
        },
        getOne(id) { }
      }
    }
  };
})();

export default Data;
