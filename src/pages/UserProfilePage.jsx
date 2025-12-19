
import UserCard from "../components/UserCard";

function UserProfilePage() {
  const name = localStorage.getItem("name");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");
  const profilePictureUrl = localStorage.getItem("profilePictureUrl");

  return (
    <div style={{ padding: 16 }}>
      <UserCard
        name={name}
        username={username}
        email={email}
        profilePictureUrl={profilePictureUrl}
      />
    </div>
  );
}

export default UserProfilePage;
