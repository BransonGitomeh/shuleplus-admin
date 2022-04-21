import emitize from "./emitize";
import { query, mutate } from "./requests";

const studentsData = [];
const parentsData = [];
const busesData = [];
const driversData = [];
const adminsData = [];
const routesData = [];
const complaintsData = []
const tripsData = [];
const schedulesData = [];
const classesData = [];
const teachersData = [];
const schoolsData = [];
const paymentsData = []
const chargesData = [];
const gradesData = [];
const subjectsData = [];
const topicsData = [];
const subtopicsData = [];
const questionsData = [];
const optionsData = [];
const teamsData = [];
const invitationsData = [];
const teamMembersData = [];
let schoolID = undefined;

var Data = (function () {
  var instance;

  // local variables to keep a cache of every entity
  var students = studentsData;
  var parents = parentsData;
  var drivers = driversData;
  var admins = adminsData;
  var buses = busesData;
  var routes = routesData;
  var schedules = schedulesData;
  var trips = tripsData;
  var complaints = complaintsData;
  var classes = classesData;
  var teachers = teachersData;
  var schools = schoolsData;
  var payments = paymentsData;
  var charges = chargesData;
  var grades = gradesData;
  var subjects = subjectsData;
  var topics = topicsData;
  var subtopics = subtopicsData;
  var questions = questionsData;
  var options = optionsData;
  var school = undefined
  var teams = teamsData;
  var invitations = invitationsData;
  var team_members = teamMembersData;

  // subscriptions for every entity to keep track of everyone subscribing to any data
  var subs = {};
  emitize(subs, "schools");
  emitize(subs, "students");
  emitize(subs, "parents");
  emitize(subs, "drivers");
  emitize(subs, "admins");
  emitize(subs, "buses");
  emitize(subs, "routes");
  emitize(subs, "schedules");
  emitize(subs, "trips");
  emitize(subs, "complaints");
  emitize(subs, "classes");
  emitize(subs, "teachers");
  emitize(subs, "payments");
  emitize(subs, "charges");
  emitize(subs, "grades");
  emitize(subs, "subjects");
  emitize(subs, "topics");
  emitize(subs, "subtopics");
  emitize(subs, "questions");
  emitize(subs, "options");
  emitize(subs, "teams");
  emitize(subs, "invitations");
  emitize(subs, "team_members");

  // subs.students = log; //subscribe to events (named 'x') with cb (log)
  // //another subscription won't override the previous one
  // subs.students = logPlus1;
  // subs.students(9); //emits '9' to all listeners;

  // when the data store gets innitialized, fetch all data and store in cache
  const init = (done) => {
    query(`{
      user{
        name,
        email,
        phone
      }
      schools{
        id,
        name,
        phone,
        email,
        address,
        id
        grades {
          id
          name
          subjects {
            id
            name
            topicOrder
            topics {
              id
              name
              subtopics {
                id
                name
                questions {
                  id
                  name
                  type
                  answers {
                    id
                    value
                  }
                  options {
                    id
                    value
                  }
                }
              }
            }
          }
        }
        invitations {
          id
          message
          user
          email
          phone
        }
        teams {
          id
          name
          members{
            id
            name
            phone
            email
            gender
          }
        }
        financial {
          balance,
          balanceFormated
        }
        charges {
          ammount
          reason
          time
          id
        }
        payments{
          ammount
          type
          phone
          ref
          time
        }
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
        admins {
          id
          names
          email
          phone
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
          message
          time
          type
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
      // done(response)
      schoolsData.push(...response.schools)

      schools = schoolsData
      school = schools[0]
      if (!school) {
        school = {
          students: []
        }
      }
      schoolID = school.id

      // schoolID = localStorage.getItem("school")                                    

      // overide the school if there is one selected
      if (localStorage.getItem("school")) {
        schoolID = localStorage.getItem("school")
        school = schools.filter(s => s.id == schoolID ? true : false)[0]
        // console.log("selected school is " + JSON.stringify(school), schools)

        if (!school) {
          school = schools[0]
        }
      } else {
        school = schools[0]
        schoolID = localStorage.setItem("school", school.id)
      }

      console.log({ schools, school })

      if(!school){
        return;
      }

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

      schools = schoolsData
      subs.schools({ schools });

      charges = school.charges
      subs.charges({ charges });

      payments = school.payments
      subs.payments({ payments });

      buses = school.buses.map(bus => ({ ...bus, driver: bus.driver ? bus.driver.username : "" }));
      subs.buses({ buses });

      parents = school.parents;
      subs.parents({ parents });

      teachers = school.teachers
      subs.teachers({ teachers });

      classes = school.classes.map(Iclass => ({ ...Iclass, student_num: Iclass.students.length || 0, teacher_name: Iclass.teacher?.name }));
      subs.classes({ classes });

      routes = school.routes;
      subs.routes({ routes });

      drivers = school.drivers;
      subs.drivers({ drivers });

      admins = school.admins;
      subs.admins({ admins });

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

      grades = school.grades;
      subs.grades({ grades });

      grades.forEach(grade => {
        grade.subjects.forEach(subject => { subjects.push(subject) })
      });
      subjects = [...subjects];
      subs.subjects({ subjects });

      subjects.forEach(subject => {
        subject.topics.forEach(topic => { topics.push(topic) })
      });
      topics = [...topics];
      subs.topics({ topics });

      topics.forEach(topic => {
        topic.subtopics.forEach(subtopic => { subtopics.push(subtopic) })
      });
      subtopics = [...subtopics];
      subs.subtopics({ subtopics });

      subtopics.forEach(subtopic => {
        subtopic.questions.forEach(question => { questions.push(question) })
      });
      questions = [...questions];
      subs.questions({ questions });

      questions.forEach(question => {
        question.options.forEach(option => { options.push(option) })
      });
      options = [...options];
      subs.options({ options });

      teams = school.teams;
      subs.teams({ teams });

      invitations = school.invitations;
      subs.invitations({ invitations });
    });
  }

  if (localStorage.getItem('authorization'))
    init(() => {
      console.log("data module initialization complete")
    })


  function createInstance() {
    // eslint-disable-next-line no-new-object
    var object = new Object("Instance here");
    return object;
  }

  return {
    onReady: (cb) => cb(),
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
    init: () => init(),
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
    user: {
      getOne() {

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
              Istudent: Object.assign(data, { school: schoolID })
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
                parent: data?.parent?.id,
                parent2: data?.parent2?.id,
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
        subs.students = cb;
        return students;
      },
      getOne(id) { }
    },
    payments: {
      list() {
        return payments;
      },
      subscribe(cb) {
        subs.payments = cb;
        return payments;
      },
      getOne(id) { }
    },
    parents: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { parents: { create: { id } } } = await mutate(
            `
          mutation ($Iparent: Iparent!) {
            parents {
              create(parent: $Iparent) {
                id
              }
            }
          }`,
            {
              Iparent: Object.assign(data, { school: schoolID })
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
      invite: data =>
        new Promise(async (resolve, reject) => {
          const { parents: { invite: { id, phone, message } } } = await mutate(
            `
            mutation ($Iinvite: Iinvite!) {
              parents {
                invite(parent: $Iinvite) {
                  id
                }
              }
            } `,
            {
              Iinvite: data
            }
          );
          const invitation = {};
          invitation.id = id;
          invitation.phone = phone;
          invitation.message = message;
          invitations = [...invitations, invitation];
          subs.invitations({ invitations });
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
    grades: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { grades: { create: { id } } } = await mutate(
            `
            mutation ($Igrade: Igrade!) {
              grades {
                create(grade: $Igrade) {
                  id
                }
              }
            } `,
            {
              Igrade: Object.assign(data, { school: schoolID })
            }
          );
          data.id = id;

          grades = [...grades, data];
          subs.grades({ grades });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Igrade: Ugrade!) {
              grades {
                update(grade: $Igrade) {
                  id
                }
              }
            } `,
            {
              Igrade: data
            }
          );

          const subtract = grades.filter(({ id }) => id !== data.id);
          grades = [data, ...subtract];
          subs.grades({ grades });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Igrade: Ugrade!) {
              grades {
                archive(grade: $Igrade) {
                  id
                }
              }
            }  `,
            {
              Igrade: {
                id: data.id
              }
            }
          );

          const subtract = grades.filter(({ id }) => id !== data.id);
          grades = [...subtract];
          subs.grades({ grades });
          resolve();
        }),
      list() {
        return grades;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.grades = cb;
        return grades;
      },
      getOne(id) { }
    },
    subjects: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { subjects: { create: { id } } } = await mutate(
            `
            mutation ($Isubject: Isubject!) {
              subjects {
                create(subject: $Isubject) {
                  id
                }
              }
            } `,
            {
              Isubject: data
            }
          );
          data.id = id;

          subjects = [...subjects, data];
          subs.subjects({ subjects });
          resolve(id);
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Isubject: Usubject!) {
              subjects {
                update(subject: $Isubject) {
                  id
                }
              }
            } `,
            {
              Isubject: data
            }
          );

          const subtract = subjects.filter(({ id }) => id !== data.id);
          subjects = [data, ...subtract];
          subs.subjects({ subjects });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Isubject: Usubject!) {
              subjects {
                archive(subject: $Isubject) {
                  id
                }
              }
            }  `,
            {
              Isubject: {
                id: data.id
              }
            }
          );

          const subtract = subjects.filter(({ id }) => id !== data.id);
          subjects = [...subtract];
          subs.subjects({ subjects });
          resolve();
        }),
      list() {
        return subjects;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.subjects = cb;
        return subjects;
      },
      getOne(id) { }
    },
    topics: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { topics: { create: { id } } } = await mutate(
            `
            mutation ($Itopic: Itopic!) {
              topics {
                create(topic: $Itopic) {
                  id
                }
              }
            } `,
            {
              Itopic: data
            }
          );
          data.id = id;

          topics = [...topics, data];
          subs.topics({ topics });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Itopic: Utopic!) {
              topics {
                update(topic: $Itopic) {
                  id
                }
              }
            } `,
            {
              Itopic: data
            }
          );

          const subtract = topics.filter(({ id }) => id !== data.id);
          topics = [data, ...subtract];
          subs.topics({ topics });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Itopic: Utopic!) {
              topics {
                archive(topic: $Itopic) {
                  id
                }
              }
            }  `,
            {
              Itopic: {
                id: data.id
              }
            }
          );

          const subtract = topics.filter(({ id }) => id !== data.id);
          topics = [...subtract];
          subs.topics({ topics });
          resolve();
        }),
      list() {
        return topics;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.topics = cb;
        return topics;
      },
      getOne(id) { }
    },
    subtopics: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { subtopics: { create: { id } } } = await mutate(
            `
            mutation ($Isubtopic: Isubtopic!) {
              subtopics {
                create(subtopic: $Isubtopic) {
                  id
                }
              }
            } `,
            {
              Isubtopic: data
            }
          );
          data.id = id;

          subtopics = [...subtopics, data];
          subs.subtopics({ subtopics });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Isubtopic: Usubtopic!) {
              subtopics {
                update(subtopic: $Isubtopic) {
                  id
                }
              }
            } `,
            {
              Isubtopic: data
            }
          );

          const subtract = subtopics.filter(({ id }) => id !== data.id);
          subtopics = [data, ...subtract];
          subs.subtopics({ subtopics });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Isubtopic: Usubtopic!) {
              subtopics {
                archive(subtopic: $Isubtopic) {
                  id
                }
              }
            }  `,
            {
              Isubtopic: {
                id: data.id
              }
            }
          );

          const subtract = subtopics.filter(({ id }) => id !== data.id);
          subtopics = [...subtract];
          subs.subtopics({ subtopics });
          resolve();
        }),
      list() {
        return subtopics;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.subtopics = cb;
        return subtopics;
      },
      getOne(id) { }
    },
    questions: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { questions: { create: { id } } } = await mutate(
            `
            mutation ($Iquestion: Iquestion!) {
              questions {
                create(question: $Iquestion) {
                  id
                }
              }
            } `,
            {
              Iquestion: data
            }
          );
          data.id = id;

          questions = [...questions, data];
          subs.questions({ questions });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Iquestion: Uquestion!) {
              questions {
                update(question: $Iquestion) {
                  id
                }
              }
            } `,
            {
              Iquestion: data
            }
          );

          const subtract = questions.filter(({ id }) => id !== data.id);
          questions = [data, ...subtract];
          subs.questions({ questions });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Iquestion: Uquestion!) {
              questions {
                archive(question: $Iquestion) {
                  id
                }
              }
            }  `,
            {
              Iquestion: {
                id: data.id
              }
            }
          );

          const subtract = questions.filter(({ id }) => id !== data.id);
          questions = [...subtract];
          subs.questions({ questions });
          resolve();
        }),
      list() {
        return questions;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.questions = cb;
        return questions;
      },
      getOne(id) { }
    },
    options: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { options: { create: { id } } } = await mutate(
            `
            mutation ($Ioption: Ioption!) {
              options {
                create(option: $Ioption) {
                  id
                }
              }
            } `,
            {
              Ioption: data
            }
          );
          data.id = id;

          options = [...options, data];
          subs.options({ options });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Ioption: Uoption!) {
              options {
                update(option: $Ioption) {
                  id
                }
              }
            } `,
            {
              Ioption: data
            }
          );

          const subtract = options.filter(({ id }) => id !== data.id);
          options = [data, ...subtract];
          subs.options({ options });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Ioption: Uoption!) {
              options {
                archive(option: $Ioption) {
                  id
                }
              }
            }  `,
            {
              Ioption: {
                id: data.id
              }
            }
          );

          const subtract = options.filter(({ id }) => id !== data.id);
          options = [...subtract];
          subs.options({ options });
          resolve();
        }),
      list() {
        return options;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.options = cb;
        return options;
      },
      getOne(id) { }
    },
    teachers: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { teachers: { create: { id } } } = await mutate(
            `
          mutation ($Iteacher: Iteacher!) {
            teachers {
              create(teacher: $Iteacher) {
                id
              }
            }
          }`,
            {
              Iteacher: Object.assign(data, { school: schoolID })
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
              update(teacher: $teacher) {
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
    schools: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
          mutation ($school: ISchool!) {
            schools {
              create(school: $school) {
                id
                error
              }
            }
          }`,
            {
              school: data
            }
          );

          if (res?.schools?.create?.error) {
            const data = {
              message: res?.schools?.create?.error
            };
            reject(data);
          } else {
            console.log(res)
            data.id = res?.schools?.create?.id;

            schools = [...schools, data];
            subs.schools({ schools });
            resolve();
          }
        }),
      list() {
        return schools;
      },
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
        mutation ($school: USchool!) {
          schools {
            update(school: $school) {
              id
            }
          }
        } 
        `,
            {
              school: data
            }
          );

          const subtract = schools.filter(({ id }) => id !== data.id);
          schools = [data, ...subtract];
          subs.schools({ schools });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
          mutation ($school: USchool!) {
            schools {
              archive(school: $school) {
                id
              }
            }
          } `,
            {
              school: data
            }
          );

          const subtract = schools.filter(({ id }) => id !== data.id);
          schools = [...subtract];
          subs.schools({ schools });
          resolve();
        }),
      invite: data =>
        new Promise(async (resolve, reject) => {
          const { schools: { invite: { id, phone, message } } } = await mutate(
            `
            mutation ($school: USchool!) {
              schools {
                invite(school: $school) {
                  id
                }
              }
            } `,
            {
              school: data
            }
          );

          const invitation = {};
          invitation.id = id;
          invitation.phone = phone;
          invitation.message = message;
          invitations = [...invitations, invitation];
          subs.invitations({ invitations });
          resolve();
        }),
      subscribe(cb) {
        // listen for even change on the students observables
        subs.schools = cb;
        return schools;
      },
      getSelected() {
        if (school)
          return school

        return {}
      },
      async archive() {
        if (school)
          await mutate(
            `mutation ($school: USchool!) {
                schools {
                  archive(school: $school) {
                    id
                  }
                }
              }`,
            {
              school: { id: school.id }
            }
          );

        return school

        return {}
      },
      async charge(phone, ammount) {
        if (school)
          return await mutate(
            `mutation ($payment: mpesaStartTxInput!) {
              payments {
                init(payment: $payment){
                  CheckoutRequestID,
                  MerchantRequestID
                }
              }
            }
            `,
            {
              "payment": {
                "id": school.id,
                ammount,
                phone
              }
            }
          );



        return {}
      },
      async verifyTx({ MerchantRequestID, CheckoutRequestID }) {
        if (school)
          return await mutate(
            `mutation ($Ipayment: mpesaStartTxVerificationInput!) {
              payments {
                confirm(payment: $Ipayment) {
                  success,
                  message
                }
              }
            }
            `,
            {
              "Ipayment": {
                MerchantRequestID,
                CheckoutRequestID,
                school: school.id
              }
            }
          );

        return school

        return {}
      }
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
              Iclass: Object.assign(data, { school: schoolID })
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
              Idriver: Object.assign(data, { school: schoolID })
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
      invite: data =>
        new Promise(async (resolve, reject) => {
          const { drivers: { invite: { id, phone, message } } } = await mutate(
            `
            mutation ($Iinvite: Iinvite!) {
              drivers {
                invite(driver: $Iinvite) {
                  id
                }
              }
            } `,
            {
              Iinvite: data
            }
          );

          const invitation = {};
          invitation.id = id;
          invitation.phone = phone;
          invitation.message = message;
          invitations = [...invitations, invitation];
          subs.invitations({ invitations });
          resolve();
        }),
      transfer: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Itransfer: Itransfer!) {
              drivers {
                transfer(driver: $Itransfer) {
                  id
                }
              }
            } `,
            {
              Itransfer: data
            }
          );

          const targetSchool = schools.filter(school => {
            return school.id === data.school;
          });

          console.log(targetSchool)

          if (targetSchool.length) {
            const driver = drivers.filter(driver => {
              return driver.id === data.driver;
            })

            if (driver.length) {
              if (!targetSchool[0].drivers) {
                targetSchool[0].drivers = [];
                targetSchool[0].drivers.push(driver[0]);
              } else {
                targetSchool[0].drivers.push(driver[0]);
              }
            }
          }

          const subtract = drivers.filter(({ id }) => id !== data.driver);
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
    admins: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
            mutation ($Iadmin: Iadmin!) {
              admins {
                create(admin: $Iadmin) {
                  id
                }
              }
            }`,
            {
              Iadmin: Object.assign(data, { school: schoolID })
            }
          );

          const { id } = res.admins.create
          data.id = id;

          admins = [...admins, data];
          subs.admins({ admins });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($admin: Uadmin!) {
            admins {
              update(admin: $admins) {
                id
              }
            }
          } 
          `,
            {
              admin: data
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
          mutation ($Iadmin: Uadmin!) {
            admins {
              archive(admin: $Iadmin) {
                id
              }
            }
          } 
          `,
            {
              Iadmins: {
                id: data.id
              }
            }
          );

          const subtract = admins.filter(({ id }) => id !== data.id);
          admins = [...subtract];
          subs.admins({ admins });
          resolve();
        }),
      invite: data =>
        new Promise(async (resolve, reject) => {
          const { drivers: { invite: { id, phone, message } } } = await mutate(
            `
            mutation ($Iinvite: Iinvite!) {
              admins {
                invite(admin: $Iinvite) {
                  id
                }
              }
            } `,
            {
              Iinvite: data
            }
          );

          const invitation = {};
          invitation.id = id;
          invitation.phone = phone;
          invitation.message = message;
          invitations = [...invitations, invitation];
          subs.invitations({ invitations });
          resolve();
        }),
      transfer: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Itransfer: Itransfer!) {
              drivers {
                transfer(driver: $Itransfer) {
                  id
                }
              }
            } `,
            {
              Itransfer: data
            }
          );

          const targetSchool = schools.filter(school => {
            return school.id === data.school;
          });

          console.log(targetSchool)

          if (targetSchool.length) {
            const driver = admins.filter(driver => {
              return driver.id === data.driver;
            })

            if (driver.length) {
              if (!targetSchool[0].admins) {
                targetSchool[0].admins = [];
                targetSchool[0].admins.push(driver[0]);
              } else {
                targetSchool[0].admins.push(driver[0]);
              }
            }
          }

          const subtract = admins.filter(({ id }) => id !== data.driver);
          admins = [...subtract];
          subs.admins({ admins });
          resolve();
        }),
      list() {
        return admins;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.admins = cb;
        return admins;
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
              bus: Object.assign(bus, { school: schoolID })
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
    charges: {
      list() {
        return charges;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.charges = cb;
        return charges;
      },
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
              Iroute: Object.assign(data, { school: schoolID })
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
              schedule: Object.assign({}, schedule, { school: schoolID })
            }
          );

          console.log(res);

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
    },
    teams: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { teams: { create: { id } } } = await mutate(
            `
            mutation ($Iteam: Iteam!) {
              teams {
                create(team: $Iteam) {
                  id
                }
              }
            } `,
            {
              Iteam: data
            }
          );
          data.id = id;
          data.members = [];

          teams = [...teams, data];
          subs.teams({ teams });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Iteam: Uteam!) {
              teams {
                update(team: $Iteam) {
                  id
                }
              }
            } `,
            {
              Iteam: data
            }
          );

          const subtract = teams.filter(({ id }) => id !== data.id);
          teams = [data, ...subtract];
          subs.teams({ teams });
          resolve();
        }),
      invite: data =>
        new Promise(async (resolve, reject) => {
          const { teams: { invite: { id, phone, message } } } = await mutate(
            `
            mutation ($Iinvite: Iinvite!) {
              teams {
                invite(team: $Iinvite) {
                  id
                }
              }
            } `,
            {
              Iinvite: data
            }
          );
          const invitation = {};
          invitation.id = id;
          invitation.phone = phone;
          invitation.message = message;
          invitations = [...invitations, invitation];
          subs.invitations({ invitations });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          mutate(
            `
            mutation ($Iteam: Uteam!) {
              teams {
                archive(team: $Iteam) {
                  id
                }
              }
            }  `,
            {
              Iteam: {
                id: data.id
              }
            }
          );

          const subtract = teams.filter(({ id }) => id !== data.id);
          teams = [...subtract];
          subs.teams({ teams });
          resolve();
        }),
      list() {
        return teams;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.teams = cb;
        return teams;
      },
      getOne(id) { }
    },
    invitations: {
      list() {
        return invitations;
      },
      subscribe(cb) {
        // listen for even change on the invitations observables
        subs.invitations = cb;
        return invitations;
      },
      getOne(id) { }
    },
    team_members: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { team_members: { create: { id } } } = await mutate(
            `
            mutation ($IteamMember: IteamMember!) {
              team_members {
                create(team_member: $IteamMember) {
                  id
                }
              }
            } `,
            {
              IteamMember: data
            }
          );
          resolve(id);
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          const { team_members: { archive: { id } } } = await mutate(
            `
            mutation ($UteamMember: UteamMember!) {
              team_members {
                archive(team_member: $UteamMember) {
                  id
                }
              }
            }  `,
            {
              UteamMember: {
                user: data.user,
                team: data.team
              }
            }
          );

          resolve(id);
        }),
    },
  };
})();

export default Data;
