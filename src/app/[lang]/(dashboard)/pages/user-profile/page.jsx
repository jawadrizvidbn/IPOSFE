
// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@views/pages/user-profile'

const ProfileTab = dynamic(() => import('@views/pages/user-profile/profile/index'))
const TeamsTab = dynamic(() => import('@views/pages/user-profile/teams/index'))
const ProjectsTab = dynamic(() => import('@views/pages/user-profile/projects/index'))
const ConnectionsTab = dynamic(() => import('@views/pages/user-profile/connections/index'))

// Vars
const tabContentList = data => ({
  profile: <ProfileTab data={data?.users.profile} />,
  teams: <TeamsTab data={data?.users.teams} />,
  projects: <ProjectsTab data={data?.users.projects} />,
  connections: <ConnectionsTab data={data?.users.connections} />
})

const getData = async () => {
  try {
    // Vars
    const res = await fetch(`${process.env.API_URL}/pages/profile`)

    if (!res.ok) {
      throw new Error('Failed to fetch profileData')
    }

    return res.json()
  } catch (err) {
    console.error('Error fetching profileData:', err)
    return null
  }
}

const ProfilePage = async () => {
  // Vars
  const data = await getData()

  return data ? <UserProfile data={data} tabContentList={tabContentList(data)} /> : <></>
}

export default ProfilePage
