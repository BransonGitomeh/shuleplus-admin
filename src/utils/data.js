import emitize from "./emitize";
import { query, mutate } from "./requests";

// Centralized cache for all data entities, both flat and nested.
const allData = {
    // Top-level tree structure
    schools: [],
    // Flat lists for easy access and table views
    students: [],
    parents: [],
    buses: [],
    drivers: [],
    admins: [],
    routes: [],
    complaints: [],
    trips: [],
    schedules: [],
    classes: [],
    teachers: [],
    payments: [],
    charges: [],
    grades: [],
    subjects: [],
    topics: [],
    subtopics: [],
    questions: [],
    options: [],
    teams: [],
    invitations: [],
    team_members: [],
};

// Centralized subscriptions object. Each key will hold an array of callbacks.
const subs = {};
let schoolID = undefined;

/**
 * =================================================================
 * The Generic Entity API Factory (REVISED for MULTI-SUBSCRIBE)
 * =================================================================
 */
const createEntityAPI = (config) => {
  const {
      name,           // Plural name (e.g., "grades")
      singularName,   // Singular name (e.g., "grade")
      isNested = false,
      parentEntity = null, // e.g. "grades" for subjects
      parentKey = null,    // e.g. "grade"
      createFields = [],
      updateFields = [],
  } = config;

  const filterPayload = (data, allowedFields) => {
      const filtered = {};
      for (const field of allowedFields) {
          if (data[field] !== undefined) {
              filtered[field] = data[field];
          }
      }
      return filtered;
  };

  const findItemInTree = (itemId, startNodes = allData.schools) => {
      for (const node of startNodes) {
          if (node.id === itemId) return { item: node, parent: null, parentList: startNodes };
          const keysToRecurse = ['grades', 'subjects', 'topics', 'subtopics', 'questions', 'options', 'members', 'students', 'classes', 'buses', 'drivers', 'admins', 'parents', 'teachers', 'routes', 'schedules', 'trips', 'complaints', 'charges', 'payments', 'teams', 'invitations'];
          for (const key of keysToRecurse) {
              if (Array.isArray(node[key])) {
                  const found = findItemInTree(itemId, node[key]);
                  if (found.item) {
                      if (found.parent === null) {
                         found.parent = node;
                         found.parentList = node[key];
                      }
                      return found;
                  }
              }
          }
      }
      return { item: null, parent: null, parentList: null };
  };

    const notifySubscribers = (entity) => {
        if (Array.isArray(subs[entity])) {
            const dataPayload = { [entity]: [...allData[entity]] };
            subs[entity].forEach(cb => cb(dataPayload));
        }
    };
    
    const notifySchoolSubscribers = () => {
        if (Array.isArray(subs.schools)) {
            const selectedSchool = allData.schools.find(s => s.id === schoolID) || {};
            subs.schools.forEach(cb => cb({ selectedSchool, schools: [...allData.schools] }));
        }
    };

  const api = {
      create: (data) => new Promise(async (resolve, reject) => {
          try {
              const payload = { ...data };
              if (!isNested && !payload.school && name !== 'schools') {
                  payload.school = localStorage.getItem("school");
              }

              const sanitizedData = filterPayload(payload, createFields);
              const mutationName = `I${singularName}`;
              const response = await mutate(
                  `mutation ($data: ${mutationName}!) { ${name} { create(${singularName}: $data) { id } } }`,
                  { data: sanitizedData }
              );

              const createdItem = response[name].create;
              const newItem = { ...data, id: createdItem.id };

              allData[name].push(newItem);
              if (isNested && payload[parentKey]) {
                  const { item: parentItem } = findItemInTree(payload[parentKey]);
                  if (parentItem) {
                      if (!Array.isArray(parentItem[name])) parentItem[name] = [];
                      parentItem[name].push(newItem);
                  } else {
                       console.warn(`Could not find parent with ID ${payload[parentKey]} to append new ${singularName}`);
                  }
              } else {
                  const school = allData.schools.find(s => s.id === payload.school);
                  if(school) {
                      if (!Array.isArray(school[name])) school[name] = [];
                      school[name].push(newItem);
                  }
              }

              // --- Notify ---
              notifySubscribers(name);
              notifySchoolSubscribers();
              if (isNested) notifySubscribers(parentEntity);

              resolve(newItem);
          } catch (error) {
              console.error(`Error creating ${singularName}:`, error);
              reject(error);
          }
      }),

      update: (data) => new Promise(async (resolve, reject) => {
          try {
              const { id, ...payload } = data;
              const sanitizedPayload = filterPayload(payload, updateFields);
              const mutationName = `U${singularName}`;
              await mutate(
                  `mutation ($data: ${mutationName}!) { ${name} { update(${singularName}: $data) { id } } }`,
                  { data: { id, ...sanitizedPayload} }
              );

              const { item: itemInTree } = findItemInTree(id, allData.schools);
              if (itemInTree) Object.assign(itemInTree, data);
              const itemIndexFlat = allData[name].findIndex(item => item.id === id);
              if (itemIndexFlat > -1) {
                  allData[name][itemIndexFlat] = { ...allData[name][itemIndexFlat], ...data };
              }

              // --- Notify ---
              notifySubscribers(name);
              notifySchoolSubscribers();
              if (isNested) notifySubscribers(parentEntity);
              resolve();
          } catch (error) {
              console.error(`Error updating ${singularName}:`, error);
              reject(error);
          }
      }),

      delete: (itemToDelete) => new Promise(async (resolve, reject) => {
          try {
              const { id } = itemToDelete;
              const mutationName = `U${singularName}`;
              await mutate(
                  `mutation ($data: ${mutationName}!) { ${name} { archive(${singularName}: $data) { id } } }`,
                  { data: { id } }
              );
              allData[name] = allData[name].filter(item => item.id !== id);
              const { parentList } = findItemInTree(id, allData.schools);
              if (parentList) {
                  const itemIndex = parentList.findIndex(item => item.id === id);
                  if(itemIndex > -1) parentList.splice(itemIndex, 1);
              }
              // --- Notify ---
              notifySubscribers(name);
              notifySchoolSubscribers();
              if (isNested) notifySubscribers(parentEntity);

              resolve();
          } catch (error) {
              console.error(`Error deleting ${singularName}:`, error);
              reject(error);
          }
      }),

      list: () => allData[name],
      subscribe: (cb) => {
          // *** FIX: SUPPORT MULTIPLE SUBSCRIBERS ***
          if (!Array.isArray(subs[name])) {
              subs[name] = [];
          }
          subs[name].push(cb);
          // Immediately notify the new subscriber with current data
          cb({ [name]: allData[name] });

          // Return a function to allow the caller to unsubscribe
          return () => {
              subs[name] = subs[name].filter(subscriber => subscriber !== cb);
          };
      },
      getOne: (id) => allData[name].find(item => item.id === id),
  };

  if (config.customMethods) {
      Object.assign(api, config.customMethods(allData, subs, api));
  }

  return api;
};


var Data = (function () {
    var instance;

    const init = () => {
        const FRAGMENT_USER_DATA = `fragment UserData on user { name email phone }`;
        const FRAGMENT_SCHOOL_DETAILS = `fragment schoolDetails on school { id name phone email address logo themeColor studentsCount parentsCount gradeOrder }`;
        const FRAGMENT_GRADES_DATA = `fragment GradesData on school {
  grades {
    id
    name
    subjectsOrder
    subjects {
      id
      name
      topicsOrder
      topics {
        id
        name
        icon
        subtopicOrder
        subtopics {
          id
          name
          questionsOrder
        }
      }
    }
  }
}`;
        const FRAGMENT_GRADES_OPTIONS_AND_IMAGES_DATA = `fragment GradesOptionsAndImagesData on school {
  id
  grades {
    id
    name
    subjects {
      id
      name
      topics {
        id
        name
        subtopics {
          id
          name
          questions {
            id
            name
            videos
            images
            contentOrder
            attachments
            optionsOrder
            options {
              id
              value
              correct
            }
          }
        }
      }
    }
  }
}`;

        const FRAGMENT_TEAMS_DATA = `fragment TeamsData on school { teams { id name members { id name phone email gender } } }`;
        const FRAGMENT_INVITATIONS_DATA = `fragment InvitationsData on school { invitations { id message user email phone } }`;
        const FRAGMENT_FINANCIAL_DATA = `fragment FinancialData on school { financial { balance, balanceFormated } charges { ammount reason time id } payments { amount type phone ref time } }`;
        const FRAGMENT_COMPLAINTS_DATA = `fragment ComplaintsData on school { complaints { id time content parent { id, name } } }`;
        const FRAGMENT_STUDENTS_DATA = `fragment StudentsData on school { students(limit: 1000, offset: 0) { id names gender registration class { id, name, teacher { id, name } } route { id, name } parent { id, national_id, name } parent2 { id, national_id, name } } }`;
        const FRAGMENT_BUSES_DATA = `fragment BusesData on school { buses { id plate make size driver { id, names } } }`;
        const FRAGMENT_DRIVERS_DATA = `fragment DriversData on school { drivers { id names phone license_expiry licence_number home } }`;
        const FRAGMENT_ADMINS_DATA = `fragment AdminsData on school { admins { id names email phone } }`;
        const FRAGMENT_PARENTS_DATA = `fragment ParentsData on school { parents { id national_id name gender email phone students { id, names, gender, route { id, name } } } }`;
        const FRAGMENT_TEACHERS_DATA = `fragment TeachersData on school { teachers { id national_id name gender phone email classes { id, name } } }`;
        const FRAGMENT_CLASSES_DATA = `fragment ClassesData on school { classes { id name students { id, names, gender, route { id, name } } teacher { id, name } } }`;
        const FRAGMENT_ROUTES_DATA = `fragment RoutesData on school { routes { id name description path { lat lng } } }`;
        const FRAGMENT_SCHEDULES_DATA = `fragment SchedulesData on school { schedules { id message time type end_time name days route { id, name } bus { id, make } } }`;
        const FRAGMENT_TRIPS_DATA = `fragment TripsData on school { trips { id startedAt isCancelled completedAt schedule { name id time end_time, route { id, name, students { id } } } bus { id, make, plate } driver { id, names } locReports { id time loc { lat lng } } events { time, type, student { id, names } } } }`;
        
        const mergeAndNotify = (response) => {
            const incomingSchools = response?.schools;
            if (!incomingSchools || incomingSchools.length === 0) return;

            const updatedSubEntities = new Set(); 

            incomingSchools.forEach(incomingSchool => {
                let school = allData.schools.find(s => s.id === incomingSchool.id);
                if (!school) {
                    school = { id: incomingSchool.id };
                    allData.schools.push(school);
                }

                Object.assign(school, incomingSchool);
                
                Object.keys(incomingSchool).forEach(key => updatedSubEntities.add(key));
            });

            if (!schoolID && allData.schools.length > 0) {
                schoolID = localStorage.getItem("school") || allData.schools[0].id;
                localStorage.setItem("school", schoolID);
            }
            
            // *** FIX: NOTIFY ALL 'schools' SUBSCRIBERS ***
            if (Array.isArray(subs.schools)) {
                const selectedSchool = allData.schools.find(s => s.id === schoolID);
                subs.schools.forEach(cb => cb({ selectedSchool, schools: [...allData.schools] }));
            }
            
            const activeSchool = allData.schools.find(s => s.id === schoolID);
            if (!activeSchool) return;

            const notifyEntity = (entityName, dataMapper) => {
                if (updatedSubEntities.has(entityName) && activeSchool[entityName]) {
                    allData[entityName] = dataMapper ? activeSchool[entityName].map(dataMapper) : activeSchool[entityName];
                    if (Array.isArray(subs[entityName])) {
                        subs[entityName].forEach(cb => cb({ [entityName]: [...allData[entityName]] }));
                    }
                }
            };

            // *** FIX: NOTIFY ALL SUBSCRIBERS FOR EACH ENTITY ***
            notifyEntity('students', s => ({...s, parent_name: s.parent?.name, class_name: s.class?.name, route_name: s.route?.name }));
            notifyEntity('parents');
            notifyEntity('drivers');
            notifyEntity('admins');
            notifyEntity('buses', b => ({...b, driver: b.driver?.names}));
            notifyEntity('routes');
            notifyEntity('complaints');
            notifyEntity('trips');
            notifyEntity('schedules', s => ({...s, bus_make: s.bus?.make, route_name: s.route?.name}));
            notifyEntity('classes', c => ({...c, student_num: c.students?.length || 0, teacher_name: c.teacher?.name}));
            notifyEntity('teachers');
            notifyEntity('invitations');

            if (updatedSubEntities.has('grades') && activeSchool.grades) {
                allData.grades = activeSchool.grades;
                allData.subjects = activeSchool.grades.flatMap(g => g.subjects || []);
                allData.topics = allData.subjects.flatMap(s => s.topics || []);
                allData.subtopics = allData.topics.flatMap(t => t.subtopics || []);
                allData.questions = allData.subtopics.flatMap(st => st.questions || []);
                allData.options = allData.questions.flatMap(q => q.options || []);
                
                ['grades', 'subjects', 'topics', 'subtopics', 'questions', 'options'].forEach(entityName => {
                    if (Array.isArray(subs[entityName])) {
                        subs[entityName].forEach(cb => cb({ [entityName]: [...allData[entityName]] }));
                    }
                });
            }
            
            if (updatedSubEntities.has('financial') || updatedSubEntities.has('charges') || updatedSubEntities.has('payments')) {
                allData.charges = activeSchool.charges || [];
                allData.payments = activeSchool.payments || [];
                if (Array.isArray(subs.charges)) subs.charges.forEach(cb => cb({ charges: [...allData.charges] }));
                if (Array.isArray(subs.payments)) subs.payments.forEach(cb => cb({ payments: [...allData.payments] }));
            }
            
            if (updatedSubEntities.has('teams') && activeSchool.teams) {
                allData.teams = activeSchool.teams;
                allData.team_members = activeSchool.teams?.flatMap(t => t.members || []) || [];
                if(Array.isArray(subs.teams)) subs.teams.forEach(cb => cb({ teams: [...allData.teams] }));
                if(Array.isArray(subs.team_members)) subs.team_members.forEach(cb => cb({ team_members: [...allData.team_members] }));
            }
        };

        const queries = [
            { query: `query GetschoolsAndUser { user { ...UserData } schools { ...schoolDetails } }${FRAGMENT_USER_DATA}${FRAGMENT_SCHOOL_DETAILS}` },
            { query: `query GetStudents { schools { id ...StudentsData } } ${FRAGMENT_STUDENTS_DATA}` },
            { query: `query GetParents { schools { id ...ParentsData } } ${FRAGMENT_PARENTS_DATA}` },
            { query: `query GetDrivers { schools { id ...DriversData } } ${FRAGMENT_DRIVERS_DATA}` },
            { query: `query GetAdmins { schools { id ...AdminsData } } ${FRAGMENT_ADMINS_DATA}` },
            { query: `query GetBuses { schools { id ...BusesData } } ${FRAGMENT_BUSES_DATA}` },
            { query: `query GetRoutes { schools { id ...RoutesData } } ${FRAGMENT_ROUTES_DATA}` },
            { query: `query GetSchedules { schools { id ...SchedulesData } } ${FRAGMENT_SCHEDULES_DATA}` },
            { query: `query GetTrips { schools { id ...TripsData } } ${FRAGMENT_TRIPS_DATA}` },
            { query: `query GetComplaints { schools { id ...ComplaintsData } } ${FRAGMENT_COMPLAINTS_DATA}` },
            { query: `query GetClasses { schools { id ...ClassesData } } ${FRAGMENT_CLASSES_DATA}` },
            { query: `query GetTeachers { schools { id ...TeachersData } } ${FRAGMENT_TEACHERS_DATA}` },
            { query: `query GetFinancials { schools { id ...FinancialData } } ${FRAGMENT_FINANCIAL_DATA}` },
            { query: `query GetGrades { schools { id ...GradesData } } ${FRAGMENT_GRADES_DATA}` },
            { query: `query GetGradesOptionsAndImages { schools { id ...GradesOptionsAndImagesData } } ${FRAGMENT_GRADES_OPTIONS_AND_IMAGES_DATA}` },
            { query: `query GetTeams { schools { id ...TeamsData } } ${FRAGMENT_TEAMS_DATA}` },
            { query: `query GetInvitations { schools { id ...InvitationsData } } ${FRAGMENT_INVITATIONS_DATA}` },
        ];

        queries.forEach(({ query: qStr, variables = {} }) => {
            query(qStr, variables)
              .then((response) => mergeAndNotify(response))
              .catch(err => {
                  if (err?.response?.status !== 401) {
                      console.error("GraphQL Query Failed:", err);
                  }
              });
        });
    };

    // if (localStorage.getItem('authorization')) {
        init();
    // }

const entityConfigs = [
  { name: "grades", singularName: "grade", createFields: ['name', 'school', 'subjectsOrder'], updateFields: ['name', 'school', 'subjectsOrder'] },
  { name: "subjects", singularName: "subject", isNested: true, parentEntity: "grades", parentKey: "grade", createFields: ['name', 'grade', 'topicsOrder', 'teacher', 'aiGeneratedCurriculum', 'topicalImages'], updateFields: ['name', 'grade', 'topicsOrder', 'teacher', 'aiGeneratedCurriculum', 'topicalImages'] },
  { name: "topics", singularName: "topic", isNested: true, parentEntity: "subjects", parentKey: "subject", createFields: ['name', 'subject', 'icon', 'subtopicOrder'], updateFields: ['name', 'subject', 'icon', 'subtopicOrder'] },
  { name: "subtopics", singularName: "subtopic", isNested: true, parentEntity: "topics", parentKey: "topic", createFields: ['name', 'topic', 'questionsOrder'], updateFields: ['name', 'topic', 'questionsOrder'] },
  { name: "questions", singularName: "question", isNested: true, parentEntity: "subtopics", parentKey: "subtopic", createFields: ['name', 'type', 'subtopic', 'videos', 'attachments', 'images', 'optionsOrder'], updateFields: ['name', 'type', 'subtopic', 'videos', 'attachments', 'images', 'optionsOrder'] },
  { name: "options", singularName: "option", isNested: true, parentEntity: "questions", parentKey: "question", createFields: ['value', 'correct', 'question'], updateFields: ['value', 'correct', 'question'] },
  { name: "students", singularName: "student", createFields: ['names', 'route', 'gender', 'registration', 'parent', 'school', 'parent2', 'class'], updateFields: ['names', 'route', 'registration', 'gender', 'parent', 'parent2', 'class'], customMethods: (allData, subs) => ({ getPage: async ({ page = 1, limit = 15 }) => { const offset = (page - 1) * limit; const response = await query(`query GetStudentPage($limit: Int, $offset: Int, $id: String) { school(id: $id) { studentsCount students(limit: $limit, offset: $offset) { id names gender registration class{name} route{id, name} parent{id, name} } } }`, { limit, offset, id: localStorage.getItem("school") }); const processedStudents = response.school?.students?.map(s => ({ ...s, parent_name: s.parent?.name, class_name: s.class?.name })) || []; return { students: processedStudents, totalCount: response.school?.studentsCount || 0 }; } })},
  { name: "parents", singularName: "parent", createFields: ['name', 'national_id', 'phone', 'email', 'school', 'password', 'gender'], updateFields: ['national_id', 'name', 'phone', 'password', 'email', 'gender'], customMethods: (allData, subs) => ({ getPage: async ({ page = 1, limit = 15 }) => { const offset = (page - 1) * limit; const response = await query(`query GetParentPage($limit: Int, $offset: Int, $id: String) { school(id: $id) { parentsCount parents(limit: $limit, offset: $offset) { id national_id name gender email phone students { names gender route { name } } } } }`, { limit, offset, id: localStorage.getItem("school") }); return { parents: response.school?.parents || [], totalCount: response.school?.parentsCount || 0 }; }, invite: (data) => new Promise(async (resolve) => { const response = await mutate(`mutation ($data: Iinvite!) { parents { invite(parent: $data) { id phone message } } }`, { data }); const invitation = response.parents.invite; allData.invitations.push(invitation); if(Array.isArray(subs.invitations)) subs.invitations.forEach(cb => cb({ invitations: [...allData.invitations] })); resolve(invitation); }) })},
  { name: "drivers", singularName: "driver", createFields: ['names', 'phone', 'username', 'email', 'license_expiry', 'licence_number', 'home', 'school', 'experience', 'bus'], updateFields: ['names', 'phone', 'username', 'email', 'license_expiry', 'licence_number', 'home', 'experience', 'bus'], customMethods: (allData, subs, api) => ({ invite: (data) => new Promise(async (resolve) => { const response = await mutate(`mutation ($data: Iinvite!) { drivers { invite(driver: $data) { id phone message } } }`, { data }); const invitation = response.drivers.invite; allData.invitations.push(invitation); if(Array.isArray(subs.invitations)) subs.invitations.forEach(cb => cb({ invitations: [...allData.invitations] })); resolve(invitation); }), transfer: (data) => new Promise(async (resolve) => { await mutate(`mutation ($data: Itransfer!) { drivers { transfer(driver: $data) { id } } }`, { data }); init(); resolve(); }) })},
  { name: "admins", singularName: "admin", createFields: ['names', 'phone', 'school', 'email', 'password'], updateFields: ['names', 'phone', 'email', 'password'], customMethods: (allData, subs) => ({ invite: (data) => new Promise(async (resolve) => { const response = await mutate(`mutation ($data: Iinvite!) { admins { invite(admin: $data) { id phone message } } }`, { data }); const invitation = response.admins.invite; allData.invitations.push(invitation); if(Array.isArray(subs.invitations)) subs.invitations.forEach(cb => cb({ invitations: [...allData.invitations] })); resolve(invitation); }) })},
  { name: "buses", singularName: "bus", createFields: ['make', 'plate', 'size', 'school', 'driver'], updateFields: ['make', 'plate', 'size', 'driver'] },
  { name: "routes", singularName: "route", createFields: ['name', 'description', 'school', 'students', 'path'], updateFields: ['name', 'description', 'students', 'path'] },
  { name: "schedules", singularName: "schedule", createFields: ['name', 'message', 'time', 'end_time', 'school', 'route', 'type', 'days', 'bus', 'driver', 'actions'], updateFields: ['name', 'message', 'time', 'end_time', 'type', 'days', 'route', 'bus', 'driver', 'actions'] },
  { name: "classes", singularName: "class", createFields: ['name', 'teacher', 'school'], updateFields: ['name', 'teacher'] },
  { name: "teachers", singularName: "teacher", createFields: ['name', 'national_id', 'phone', 'email', 'school', 'gender', 'password'], updateFields: ['national_id', 'name', 'phone', 'email', 'gender', 'password'] },
  { name: "teams", singularName: "team", createFields: ['name', 'school'], updateFields: ['name', 'school'], customMethods: (allData, subs) => ({ invite: (data) => new Promise(async (resolve) => { const response = await mutate(`mutation ($data: Iinvite!) { teams { invite(team: $data) { id phone message } } }`, { data }); const invitation = response.teams.invite; allData.invitations.push(invitation); if(Array.isArray(subs.invitations)) subs.invitations.forEach(cb => cb({ invitations: [...allData.invitations] })); resolve(invitation); }) })},
  { name: "team_members", singularName: "team_member", createFields: ['team', 'user'], updateFields: ['team', 'user'] },
  { name: "complaints", singularName: "complaint", createFields: ['parent', 'school', 'content', 'time'], updateFields: ['parent', 'content', 'time'] },
  { name: "trips", singularName: "trip", createFields: ['startedAt', 'completedAt', 'isCancelled', 'school', 'driver', 'schedule'], updateFields: ['startedAt', 'completedAt', 'isCancelled', 'schedule'] },
  { name: "payments", singularName: "payment", createFields: ['school', 'phone', 'ammount', 'type', 'ref', 'time'], updateFields: ['phone', 'school', 'ammount', 'type', 'ref', 'time'] },
  { name: "charges", singularName: "charge", createFields: ['school', 'ammount', 'reason', 'time'], updateFields: ['school', 'ammount', 'reason', 'time'] },
  { name: "invitations", singularName: "invitation", createFields: ['school', 'user', 'message', 'phone', 'email'], updateFields: ['school', 'user', 'message', 'phone', 'email'] },
];

    const generatedApis = {};
    entityConfigs.forEach(config => {
        generatedApis[config.name] = createEntityAPI(config);
    });

    instance = {
        ...generatedApis,
        init,
        auth: {
            login: (id) => ({}),
            getUser: (id) => ({}),
            logout: (id, data) => {},
        },
        user: {
            getOne: () => ({}),
        },
        communication: {
            sms: {
                create: sms => mutate(`mutation($sms : Isms!){ sms{ send(sms: $sms) } }`, { sms })
            }
        },
        schools: {
            list: () => allData.schools,
            // *** FIX: ROBUST SCHOOLS SUBSCRIBE METHOD ***
            subscribe: (cb) => {
                if (!Array.isArray(subs.schools)) {
                    subs.schools = [];
                }
                subs.schools.push(cb);
                // Call immediately with the current state.
                const selectedSchool = allData.schools.find(s => s.id === (schoolID || localStorage.getItem("school")));
                cb({ schools: [...allData.schools], selectedSchool: selectedSchool || {} });
                // Return an unsubscribe function.
                return () => {
                    subs.schools = subs.schools.filter(subscriber => subscriber !== cb);
                };
            },
            update: (data) => new Promise(async (resolve, reject) => {
                try {
                    const { id, ...payload } = data;
                    const sanitizedPayload = payload;
                    // ... (rest of the update logic)
                    const response = await mutate(
                        `mutation ($data: USchool!) { schools { update(school: $data) { id } } }`,
                        { data: { id, ...sanitizedPayload} }
                    );
            
                    const updatedSchool = { ...data, id: response.schools.update.id };
                    const itemIndexFlat = allData.schools.findIndex(item => item.id === id);
                    if (itemIndexFlat > -1) {
                        allData.schools[itemIndexFlat] = updatedSchool;
                    }
            
                    // --- Notify (FIXED) ---
                    if (Array.isArray(subs.schools)) {
                        // Also find the currently selected school to send it in the payload.
                        const selectedSchool = allData.schools.find(s => s.id === schoolID);
                        subs.schools.forEach(cb => cb({
                            schools: [...allData.schools],
                            selectedSchool: selectedSchool || {} // Ensure selectedSchool is at least an empty object
                        }));
                    }
                    resolve(updatedSchool);
                } catch (error) {
                    console.error(`Error updating school:`, error);
                    reject(error);
                }
            }),
            create: (data) => new Promise(async (resolve, reject) => {
                try {
                    const response = await mutate(
                        `mutation ($data: Ischool!) { schools { create(school: $data) { id } } }`,
                        { data }
                    );
                    const newSchool = { ...data, id: response.schools.create.id };
                    allData.schools.push(newSchool);
                     if (Array.isArray(subs.schools)) {
                        subs.schools.forEach(sCb => sCb({ schools: [...allData.schools] }));
                     }
                resolve(newSchool);
                } catch (error) {
                    reject(error);
                }
            }),
            getSelected: () => allData.schools.find(s => s.id === localStorage.getItem("school")) || {},
            archive: () => new Promise(async (resolve, reject) => {
                const school = instance.schools.getSelected();
                if (!school.id) return reject("No school selected");
                await mutate(`mutation ($data: Uschool!) { schools { archive(school: $data) { id } } }`, { data: { id: school.id } });
                allData.schools = allData.schools.filter(s => s.id !== school.id);
                if (Array.isArray(subs.schools)) {
                   subs.schools.forEach(sCb => sCb({ schools: [...allData.schools] }));
                }
                resolve(school);
            }),
            charge: (phone, ammount) => {
                const school = instance.schools.getSelected();
                if (!school.id) return Promise.reject("No school selected");
                return mutate(`mutation ($payment: mpesaStartTxInput!) { payments { init(payment: $payment){ id, CheckoutRequestID, MerchantRequestID } } }`, {
                    payment: { school: school.id, ammount, phone }
                });
            },
            verifyTx: ({ merchantRequestID, checkoutRequestID }) => {
                 const school = instance.schools.getSelected();
                 if (!school.id) return Promise.reject("No school selected");
                 return mutate(`mutation ($data: mpesaStartTxVerificationInput!) { payments { confirm(payment: $data) { success, message, id, amount, phone, status, ref, time } } }`, {
                     data: { merchantRequestID, checkoutRequestID, school: school.id }
                 });
            }
        },
    };

    return {
        getInstance: function () {
            return instance;
        }
    };
})();

export default Data.getInstance();