import React from 'react';

import { UserDto } from '@/features/auth/types';
import { Button } from '@/shared/ui';
import { Wrapper } from '@/shared/ui/Wrapper';

interface ProfileProjectsProps {
  user: UserDto;
  handleLogout: () => void;
}

const ProfileProjects = ({ user, handleLogout }: ProfileProjectsProps) => {
  return (
    <Wrapper className="flex flex-col h-full p-10 justify-between">
      <div>
        <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Current Activity</h2>
        {user.createdProjects?.length > 0 ? (
          <ul className="flex flex-col gap-2.5 mb-2.5">
            {user.createdProjects.map((project) => (
              <li key={project.id}>
                <Wrapper>{project.title}</Wrapper>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No active project</p>
        )}
      </div>

      <Button onClick={handleLogout} variant="danger" className="w-full py-3 text-lg">
        Logout from Account
      </Button>
    </Wrapper>
  );
};

export default ProfileProjects;
