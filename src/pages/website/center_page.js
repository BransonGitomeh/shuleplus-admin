import "./carousel.css"
import React from "react";
import { Link } from "react-router-dom";
import connected_commute from "./images/connected_commute.svg"
import connected_fleet from "./images/connected_fleet.svg"

function Page() {
    return (<div>
        
        <main role="main">
          <div id="myCarousel" className="carousel slide" data-ride="carousel">
            <ol className="carousel-indicators">
              <li data-target="#myCarousel" data-slide-to={0} className="active" />
              <li data-target="#myCarousel" data-slide-to={1} />
              <li data-target="#myCarousel" data-slide-to={2} />
            </ol>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img
                  className="first-slide"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="First slide"
                />
                <div className="container">
                  <div className="carousel-caption text-left">
                    <h1>Welcome to ShulePlus.</h1>
                    <p>
                      The <b>automated</b> communications solution for your schools.
                    </p>
                    <p>
                      <Link className="btn btn-lg btn-primary" to="/register" role="button">
                        Register your school today
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  className="second-slide"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="Second slide"
                />
                <div className="container">
                  <div className="carousel-caption">
                    <h1>Connect to your parents directly.</h1>
                    <p>
                      Parents get realtime information of where their children are.
                    </p>
                    <p>
                      <a className="btn btn-lg btn-primary" href="#" role="button">
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="carousel-item">
                <img
                  className="third-slide"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="Third slide"
                />
                <div className="container">
                  <div className="carousel-caption text-right">
                    <h1>One more for good measure.</h1>
                    <p>
                      Cras justo odio, dapibus ac facilisis in, egestas eget quam.
                      Donec id elit non mi porta gravida at eget metus. Nullam id
                      dolor id nibh ultricies vehicula ut id elit.
                    </p>
                    <p>
                      <a className="btn btn-lg btn-primary" href="#" role="button">
                        Browse gallery
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <a
              className="carousel-control-prev"
              href="#myCarousel"
              role="button"
              data-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true" />
              <span className="sr-only">Previous</span>
            </a>
            <a
              className="carousel-control-next"
              href="#myCarousel"
              role="button"
              data-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="sr-only">Next</span>
            </a>
          </div>
          {/* Marketing messaging and featurettes
      ================================================== */}
          {/* Wrap the rest of the page in another container to center all the content. */}
          <div className="container marketing">
            {/* Three columns of text below the carousel */}
            <div className="row">
              <div className="col-lg-4">
                <img
                  className="rounded-circle"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="Generic placeholder image"
                  width={140}
                  height={140}
                />
                <hr/>
                <h2></h2>
                <p>
                </p>
                <p>
                  <a className="btn btn-secondary" href="#" role="button">
                    View details »
                  </a>
                </p>
              </div>
              {/* /.col-lg-4 */}
              <div className="col-lg-4">
                <img
                  className="rounded-circle"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="Generic placeholder image"
                  width={140}
                  height={140}
                />
                <h2>Heading</h2>
                <p>
                  Duis mollis, est non commodo luctus, nisi erat porttitor ligula,
                  eget lacinia odio sem nec elit. Cras mattis consectetur purus sit
                  amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor
                  mauris condimentum nibh.
                </p>
                <p>
                  <a className="btn btn-secondary" href="#" role="button">
                    View details »
                  </a>
                </p>
              </div>
              {/* /.col-lg-4 */}
              <div className="col-lg-4">
                <img
                  className="rounded-circle"
                  src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
                  alt="Generic placeholder image"
                  width={140}
                  height={140}
                />
                <h2>Heading</h2>
                <p>
                  Donec sed odio dui. Cras justo odio, dapibus ac facilisis in,
                  egestas eget quam. Vestibulum id ligula porta felis euismod semper.
                  Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum
                  nibh, ut fermentum massa justo sit amet risus.
                </p>
                <p>
                  <a className="btn btn-secondary" href="#" role="button">
                    View details »
                  </a>
                </p>
              </div>
              {/* /.col-lg-4 */}
            </div>
            
            {/* /.row */}
            {/* START THE FEATURETTES */}
            <div className="row featurette">
              <div className="col-md-7">
                <h2 className="featurette-heading">
                  Connected{" "}
                  <span className="text-muted">Commute.</span>
                </h2>
                <p className="lead">
                  Real-time mobility management platform to create more intelligent and safer connected commute for your children.
                </p>
              </div>
              <div className="col-md-5">
                <img
                  className="featurette-image img-fluid mx-auto"
                  src={connected_commute}
                  alt="Generic placeholder image"
                />
              </div>
            </div>
            <hr className="featurette-divider" />
            <div className="row featurette">
              <div className="col-md-7 order-md-2">
                <h2 className="featurette-heading">
                  Best Bus Fleet.{" "}
                  <span className="text-muted">Management System.</span>
                </h2>
                <p className="lead">
                  Real-time bus fleet management platform which unifies cost, efficiency, productivity and safety by leveraging location technology and innovation.
                </p>
              </div>
              <div className="col-md-5 order-md-1">
                <img
                  className="featurette-image img-fluid mx-auto"
                  src={connected_fleet}
                  alt="Generic placeholder image"
                />
              </div>
            </div>
            {/* /END THE FEATURETTES */}
          </div>
          {/* /.container */}
          {/* FOOTER */}
          <footer className="container">
            <p className="float-right">
              <a href="#">Back to top</a>
            </p>
            <p>
              © 2017-2018 Company, Inc. · <a href="#">Privacy</a> ·{" "}
              <a href="#">Terms</a>
            </p>
          </footer>
        </main>
      </div>
      )
}

export default Page