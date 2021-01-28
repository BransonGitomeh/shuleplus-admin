import React from "react";

import Table from "./components/table";
import Data from "../../utils/data";

const $ = window.$;

class BasicTable extends React.Component {
  state = {
    teams: [],
    members: [],
    teachers: [],
    filteredTeachers: [],
    selectedTeam: '',
    selectedTeamName: '',
    selectedUser: '',
  };
  componentDidMount() {
    const teams = Data.teams.list();
    this.setState({ teams });
    Data.teams.subscribe(({ teams }) => {
      this.setState({ teams });
    });

    const teachers = Data.teachers.list();
    this.setState({ teachers, filteredTeachers: teachers });
    Data.teachers.subscribe(({ teachers }) => {
      this.setState({ teachers, filteredTeachers: teachers });
    });
  }

  saveTeamId = name => {
    this.setState({ filteredTeachers: this.state.teachers });
    const teams = this.state.teams.filter(team => {
      return team.name === name;
    });

    if(teams.length){
      this.setState({selectedTeam: teams[0].id});
      const team_members = teams[0].team_members;
      if(team_members.length){
        const members = team_members.map(team_member => {
          return team_member.members[0];
        })

        const filteredTeachers = [];
        this.state.teachers.forEach(teacher => {
          let count = 0;
          members.forEach(member => {
            if(member.id == teacher.id){
              count++;
            }
          });
          if(count == 0){
            filteredTeachers.push(teacher);
          }
        });

        this.setState({members, filteredTeachers});
      }else{
        this.setState({members: []});
      }
    }
  }

  submitHandler = async() => {
    try {
      const data = {};
      Object.assign(data, {
        team: this.state.selectedTeam,
        user: this.state.selectedUser,
      });

      const response_id = await Data.team_members.create(data);
      const user = this.state.teachers.filter(teacher => {
        return teacher.id == data.user;
      });

      if(user.length){
        const members = [...this.state.members, user[0]];

        const filteredTeachers = [];
        this.state.teachers.forEach(teacher => {
          let count = 0;
          members.forEach(member => {
            if(member.id == teacher.id){
              count++;
            }
          });
          if(count == 0){
            filteredTeachers.push(teacher);
          }
        });

        this.setState({members, filteredTeachers});

        const team = this.state.teams.filter(team => {
          return team.id == data.team;
        });

        if(team.length){
          data.id = response_id;
          data.members = []
          data.members.push(user[0]);
          team[0].team_members.push(data);

          const teams = this.state.teams.map(team => {
            if(team.id == team[0].id){
              return team[0];
            }
            return team;
          });

          this.setState({ teams });
        }
      }
    } catch (error) {
    }
  }

  removeHandler = async() => {
    try {
      const data = {};

      const team = this.state.teams.filter(team => {
        return team.id == this.state.selectedTeam;
      });

      if(team.length){
        const team_members = team[0].team_members;
        if(team_members.length){
          const member = team_members.filter(team_member => {
            return team_member.members[0].id == this.state.selectedUser;
          });

          if(member.length){
            Object.assign(data, {
              id: member[0].id
            });
      
            await Data.team_members.delete(data);
            const subtracted_team_members = team_members.filter(team_member => {
              return team_member.id != data.id;
            });

            const subtracted_members = subtracted_team_members[0].members.filter(member => {
              return member.id != this.state.selectedUser;
            });

            console.log('Members', subtracted_members)
            const filteredTeachers = [];
            this.state.teachers.forEach(teacher => {
              let count = 0;
              subtracted_members.forEach(member => {
                if(member.id == teacher.id){
                  count++;
                }
              });
              if(count == 0){
                filteredTeachers.push(teacher);
              }
            });
            console.log('Filtered Teachers', filteredTeachers);
            this.setState({filteredTeachers, members: subtracted_members});

            // team[0].team_members = members;
            team[0].team_members = subtracted_team_members;
            const teams = this.state.teams.map(team => {
              if(team.id == team[0].id){
                return team[0];
              }
              return team;
            });

            this.setState({teams});
          }
        }
      }
    } catch (error) {
    }
  }

  onSearch = e => {
    const { teachers } = this.state
    const filteredTeachers = teachers.filter(teacher => teacher.name.toLowerCase().match(e.target.value.toLowerCase()))
    this.setState({ filteredTeachers })
  }

  render() {
    const { teams, members } = this.state;
    return (
      <div className="kt-quick-panel--right kt-demo-panel--right kt-offcanvas-panel--right kt-header--fixed kt-header-mobile--fixed kt-aside--enabled kt-aside--left kt-aside--fixed kt-aside--offcanvas-default kt-page--loading">
        <div className="kt-grid kt-grid--hor kt-grid--root">
          <div className="kt-portlet kt-portlet--mobile">
            <div className="kt-portlet__body">
              {/*begin: Search Form */}
              <div className="kt-form kt-fork--label-right kt-margin-t-20 kt-margin-b-10">
                <div className="row align-items-center">
                  <div className="col-xl-8 order-2 order-xl-1">
                    <div className="row align-items-center">
                      <div className="col-md-4 kt-margin-b-20-tablet-and-mobile">
                        <div className="kt-input-icon kt-input-icon--left">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search..."
                            onChange={this.onSearch}
                            id="generalSearch"
                          />
                          <span className="kt-input-icon__icon kt-input-icon__icon--left">
                            <span>
                              <i className="la la-search" />
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 order-2 order-xl-1">
                    <div class="form-group">
                      <label for="exampleFormControlSelect1">Teams list</label>
                      <select
                        name="seats"
                        type="text"
                        className="form-control form-control"
                        id="exampleFormControlSelect1"
                        required
                        value={this.state.selectedTeamName}
                        onChange={(e) => this.setState({
                          selectedTeamName: e.target.value
                        }, this.saveTeamId(e.target.value))}
                      >
                        <option value="">Select Team</option>
                        {teams.map(team => {
                          return <option key={team.id}>{team.name}</option>
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {/*end: Search Form */}
            </div>
            <div className="container">
              <div className="row">
                <div className="col-xl-6 order-2 order-xl-1">
                  <h5>Users</h5>
                  <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
                    <Table
                      headers={[
                        {
                          label: "Name",
                          key: "name"
                        },
                        {
                          label: "Phone number",
                          key: "phone"
                        },
                      ]}
                      data={this.state.filteredTeachers}
                      options={{ addable: true, deleteable: false }}
                      add={user => {
                        this.setState({ selectedUser: user.id }, () => {
                          this.submitHandler();
                        })
                      }}
                    />
                  </div>
                </div>
                <div className="col-xl-6 order-2 order-xl-1">
                  <h5>Team Members</h5>
                  <div className="kt-portlet__body" style={{ minHeight: "500px" }}>
                    <Table
                      headers={[
                        {
                          label: "Name",
                          key: "name"
                        },
                        {
                          label: "Phone number",
                          key: "phone"
                        },
                      ]}
                      data={members}
                      options={{ addable: false, deleteable: true }}
                      remove={user => {
                        this.setState({ selectedUser: user.id }, () => {
                          this.removeHandler();
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BasicTable;



