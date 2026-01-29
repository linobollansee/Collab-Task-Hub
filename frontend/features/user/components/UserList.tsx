import { useAuth } from '@/features/auth/hooks/useAuth';
import { AddMember } from '@/features/members/components/AddMember';
import { MembersList } from '@/features/members/components/MembersList';
import { useMembers } from '@/features/members/hooks/useMember';
import ConfirmDeleteModal from '@/features/modal/components/ConfirmDeleteModal';
import { useModal } from '@/features/modal/hooks/useModal';
import { useProjects } from '@/features/project/hooks/useProject';
import { ProjectRole } from '@/features/project/types';
import { Button } from '@/shared/ui';

const UserList = () => {
  const { openModal, closeModal } = useModal();
  const { deleteMember, updateRole } = useMembers();
  const { selectedProject } = useProjects();
  const { user } = useAuth();

  if (!selectedProject || !user) return;
  const projectId = selectedProject.id;
  const admins = selectedProject.members.filter((m) => m.role === 'admin');
  const myMember = selectedProject.members.find((member) => member.userId === user.id);
  const isAdmin = myMember?.role === ProjectRole.ADMIN;
  const lastAdminId = admins.length === 1 ? admins[0].id : null;

  const openNotAllowed = (text: string) => {
    openModal(
      <div>
        <h3>Action not allowed</h3>
        <p className="mt-2 mb-4">{text}</p>
        <Button variant="primary" onClick={closeModal}>
          Ok
        </Button>
      </div>,
    );
  };
  const handlerDeleteMember = (memberId: string, isLastAdmin: boolean) => {
    if (isLastAdmin) {
      openNotAllowed("You can't remove the last admin. Please assign another admin first.");
    }
    openModal(
      <ConfirmDeleteModal
        entityName="member"
        onConfirm={() => deleteMember(projectId, memberId)}
      />,
    );
  };

  const handleChangeRole = async (memberId: string, role: ProjectRole, isLastAdmin: boolean) => {
    if (isLastAdmin && role !== 'admin') {
      openNotAllowed("You can't demote the last administrator. Please assign another admin first.");
      return;
    }

    await updateRole(projectId, memberId, role);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() =>
              openModal(
                <AddMember
                  projectId={projectId}
                  onClose={closeModal}
                  members={selectedProject.members}
                />,
              )
            }
          >
            Add member
          </Button>
        )}
      </div>

      <MembersList
        members={selectedProject.members}
        adminRole={isAdmin}
        lastAdminId={lastAdminId}
        onDelete={handlerDeleteMember}
        onChangeRole={handleChangeRole}
      />
    </div>
  );
};

export default UserList;
