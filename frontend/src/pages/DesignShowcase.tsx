import { PageHeader, WorkspaceContainer } from '../design-system';
import {
  ButtonsSection,
  DataSection,
  DisplaySection,
  FeedbackSection,
  InputsSection,
  NavigationSection,
  OverlaySection,
  SelectionSection,
  VoiceSection,
} from '../showcase/sections';

/** Internal validation surface — every component and state on one page. */
export function DesignShowcase() {
  return (
    <WorkspaceContainer
      header={<PageHeader title="Design System" description="Every JARVIS component and state, on one page." />}
    >
      <div className="flex flex-col gap-10 pb-24">
        <ButtonsSection />
        <InputsSection />
        <SelectionSection />
        <FeedbackSection />
        <DisplaySection />
        <DataSection />
        <NavigationSection />
        <OverlaySection />
        <VoiceSection />
      </div>
    </WorkspaceContainer>
  );
}
