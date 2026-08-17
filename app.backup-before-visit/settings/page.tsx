import Navigation from "@/components/Navigation";

export default function SettingsPage() {
  return (
    <main>
      <Navigation />
      <h1>Settings</h1>
      <p>SAMS System Settings</p>
      <h2>Configuration</h2>
      <ul>
        <li>Hospital Information</li>
        <li>User Management</li>
        <li>System Preferences</li>
        <li>Security</li>
      </ul>
    </main>
  );
}
