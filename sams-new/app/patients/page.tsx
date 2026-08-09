import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";

export default function PatientsPage() {
  return (
      <main>
            <Sidebar />

                  <div>
                          <Navigation />

                                  <header>
                                            <h1>Patient Management</h1>
                                                      <p>Manage patient registration and records</p>
                                                              </header>

                                                                      <section>
                                                                                <h2>Patient Overview</h2>

                                                                                          <div>
                                                                                                      <h3>Total Patients</h3>
                                                                                                                  <p>1,248</p>
                                                                                                                            </div>

                                                                                                                                      <div>
                                                                                                                                                  <h3>Today's Registrations</h3>
                                                                                                                                                              <p>18</p>
                                                                                                                                                                        </div>

                                                                                                                                                                                  <div>
                                                                                                                                                                                              <h3>Active Patients</h3>
                                                                                                                                                                                                          <p>1,102</p>
                                                                                                                                                                                                                    </div>
                                                                                                                                                                                                                            </section>

                                                                                                                                                                                                                                    <section>
                                                                                                                                                                                                                                              <h2>Quick Actions</h2>

                                                                                                                                                                                                                                                        <p>
                                                                                                                                                                                                                                                                    <a href="/patients/new">+ Register New Patient</a>
                                                                                                                                                                                                                                                                              </p>

                                                                                                                                                                                                                                                                                        <p>
                                                                                                                                                                                                                                                                                                    <a href="/patients/list">View Patient List</a>
                                                                                                                                                                                                                                                                                                              </p>
                                                                                                                                                                                                                                                                                                                      </section>

                                                                                                                                                                                                                                                                                                                              <section>
                                                                                                                                                                                                                                                                                                                                        <h2>Recent Patients</h2>

                                                                                                                                                                                                                                                                                                                                                  <ul>
                                                                                                                                                                                                                                                                                                                                                              <li>Patient 001 — OPD</li>
                                                                                                                                                                                                                                                                                                                                                                          <li>Patient 002 — PM&R</li>
                                                                                                                                                                                                                                                                                                                                                                                      <li>Patient 003 — Physiotherapy</li>
                                                                                                                                                                                                                                                                                                                                                                                                  <li>Patient 004 — Consultation</li>
                                                                                                                                                                                                                                                                                                                                                                                                            </ul>
                                                                                                                                                                                                                                                                                                                                                                                                                    </section>
                                                                                                                                                                                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                                                                                                                                                                                              </main>
                                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                                                }