import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { useMembers } from "../hooks/useMembers";
import { SearchableMultiSelect } from "../components/SearchableMultiSelect";
import { PageLayout } from "../components/PageLayout";
import { Button } from "@/components/ui/button";

export function AttendeeSelectPage() {
  const navigate = useNavigate();
  const { data: members, isLoading } = useMembers();
  const selectedAttendees = useStore((s) => s.selectedAttendees);
  const setAttendees = useStore((s) => s.setAttendees);
  const reset = useStore((s) => s.reset);

  const memberNames = members?.map((m) => m.name) ?? [];
  const selectedNames = selectedAttendees.map((a) => a.name);

  const handleChange = (names: string[]) => {
    if (!members) return;
    const attendees = names
      .map((name) => members.find((m) => m.name === name))
      .filter((m): m is { id: number; name: string } => m !== undefined);
    setAttendees(attendees);
  };

  const handleNext = () => {
    if (selectedAttendees.length > 0) {
      navigate("/rolling-pool");
    }
  };

  return (
    <PageLayout center>
      <h1 className="mb-2 text-center text-4xl font-light tracking-tight text-foreground">
        Misc. Movie Monday
      </h1>
      <p className="mb-8 text-center text-muted-foreground">
        Select who's attending tonight
      </p>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading members...</p>
      ) : (
        <SearchableMultiSelect
          options={memberNames}
          selected={selectedNames}
          onChange={handleChange}
          placeholder="Search for a name..."
        />
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
        <Button variant="outline" onClick={() => navigate("/rankings")}>
          View Rankings
        </Button>
        <Button
          onClick={handleNext}
          disabled={selectedAttendees.length === 0}
          className="flex-1"
        >
          Roll →
        </Button>
      </div>
    </PageLayout>
  );
}
