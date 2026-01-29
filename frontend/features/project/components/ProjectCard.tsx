import { ProjectCardProps } from '@/features/project/types';
import { Wrapper } from '@/shared/ui/Wrapper';

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Wrapper className="h-full">
      <div>
        <h3 className="text-xl font-bold border-b pb-2">{project.title}</h3>
        <p className="mt-4 text-sm line-clamp-3">{project.description || 'No description'}</p>
      </div>
    </Wrapper>
  );
}
