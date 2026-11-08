import { useRef, useState, type FormEvent } from "react";
import { Plus, Save } from "lucide-react";
import {
  Badge,
  Button,
  Checkbox,
  DataTable,
  Dialog,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  TextField,
  colorRoles,
  colors,
  contrastRatio,
  useTheme,
  useToast,
  type DataTableColumn,
  type ThemePreference,
} from "../../src";

export function ButtonExample() {
  const [saving, setSaving] = useState(false);
  return (
    <div className="row">
      <Button icon={<Plus size={16} aria-hidden="true" />}>Add equipment</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Retire</Button>
      <Button size="sm" variant="secondary">
        Small
      </Button>
      <Button
        icon={<Save size={16} aria-hidden="true" />}
        loading={saving}
        onClick={() => {
          setSaving(true);
          window.setTimeout(() => setSaving(false), 1500);
        }}
      >
        {saving ? "Saving" : "Save (simulated)"}
      </Button>
    </div>
  );
}

export function FieldsExample() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailError = submitted && !/^\S+@\S+\.\S+$/.test(email) ? "Enter an email like name@example.com" : undefined;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      <TextField
        label="Email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint="Used for booking reminders."
        error={emailError}
      />
      <Select
        label="Home space"
        placeholder="Choose a space"
        defaultValue=""
        options={[
          { value: "riverside", label: "Riverside Makers" },
          { value: "foundry", label: "Foundry Lane Workshop" },
          { value: "closed", label: "Old Mill (closed)", disabled: true },
        ]}
      />
      <Checkbox label="Send me a weekly digest" description="One email on Mondays. Unsubscribe any time." />
      <div>
        <Button type="submit">Validate</Button>
      </div>
    </form>
  );
}

export function TabsExample() {
  return (
    <Tabs
      label="Laser cutter details"
      items={[
        { id: "overview", label: "Overview", content: <p>60 W laser for wood, acrylic, and card up to 6 mm.</p> },
        { id: "safety", label: "Safety", content: <p>Never leave a running job unattended. Keep the lid closed.</p> },
        { id: "maintenance", label: "Maintenance", content: <p>Out of service for lens cleaning.</p>, disabled: true },
        { id: "history", label: "History", content: <p>Bought in 2029. Tube replaced in 2031.</p> },
      ]}
    />
  );
}

export function DialogExample() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Retire laser cutter
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Retire this equipment?"
        description="Members will no longer be able to book it. Past bookings stay in the history."
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setOpen(false);
                toast({ title: "Laser cutter retired", tone: "success" });
              }}
            >
              Retire
            </Button>
          </>
        }
      />
    </>
  );
}

export function ToastExample() {
  const { toast } = useToast();
  return (
    <div className="row">
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Booking saved", description: "Wood lathe, Tuesday 10:00", tone: "success" })}
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Booking failed", description: "That slot was just taken.", tone: "danger" })}
      >
        Error toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: "Kiln firing tonight", description: "Stays until dismissed.", duration: null })}
      >
        Persistent toast
      </Button>
    </div>
  );
}

interface Booking {
  id: string;
  equipment: string;
  member: string;
  hours: number | null;
  status: "confirmed" | "cancelled";
}

const BOOKINGS: Booking[] = [
  { id: "1", equipment: "Wood lathe", member: "Cora Mbeki", hours: 1.5, status: "confirmed" },
  { id: "2", equipment: "Laser cutter", member: "Ada Okafor", hours: 2, status: "confirmed" },
  { id: "3", equipment: "Pottery kiln", member: "Theo Marsh", hours: null, status: "cancelled" },
  { id: "4", equipment: "FDM printer A", member: "Ben Lindqvist", hours: 4, status: "confirmed" },
];

const BOOKING_COLUMNS: DataTableColumn<Booking>[] = [
  { key: "equipment", header: "Equipment", cell: (row) => row.equipment, sortValue: (row) => row.equipment },
  { key: "member", header: "Member", cell: (row) => row.member, sortValue: (row) => row.member },
  { key: "hours", header: "Hours", cell: (row) => row.hours ?? "—", sortValue: (row) => row.hours, align: "end" },
  {
    key: "status",
    header: "Status",
    cell: (row) => <Badge tone={row.status === "confirmed" ? "success" : "danger"}>{row.status}</Badge>,
  },
];

export function DataTableExample() {
  const [state, setState] = useState<"data" | "loading" | "empty">("data");
  return (
    <div className="stack">
      <Select
        label="Table state"
        value={state}
        onChange={(event) => setState(event.target.value as typeof state)}
        options={[
          { value: "data", label: "With data" },
          { value: "loading", label: "Loading" },
          { value: "empty", label: "Empty" },
        ]}
      />
      <DataTable
        caption="This week's bookings"
        columns={BOOKING_COLUMNS}
        rows={state === "empty" ? [] : BOOKINGS}
        getRowId={(row) => row.id}
        loading={state === "loading"}
        emptyState="No bookings this week."
      />
    </div>
  );
}

export function FeedbackExample() {
  return (
    <div className="row">
      <Spinner label="Loading schedule" />
      <Badge>neutral</Badge>
      <Badge tone="accent">accent</Badge>
      <Badge tone="success">success</Badge>
      <Badge tone="warning">warning</Badge>
      <Badge tone="danger">danger</Badge>
      <div style={{ width: "12rem" }}>
        <Skeleton height="0.9rem" />
      </div>
    </div>
  );
}

export function ThemeSelect() {
  const { preference, setPreference } = useTheme();
  return (
    <Select
      label="Theme"
      value={preference}
      onChange={(event) => setPreference(event.target.value as ThemePreference)}
      options={[
        { value: "system", label: "Match system" },
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
    />
  );
}

export function TokensExample() {
  const { resolvedTheme } = useTheme();
  const palette = colors[resolvedTheme];
  return (
    <ul className="swatches" aria-label={`Color tokens, ${resolvedTheme} theme`}>
      {colorRoles.map((role) => {
        const ratio = contrastRatio(palette.text, palette[role]);
        return (
          <li key={role}>
            <span className="swatch" style={{ background: `var(--color-${role})` }} aria-hidden="true" />
            <code>--color-{role}</code>
            <span className="mono muted">{palette[role]}</span>
            <span className="mono muted">body text on it: {ratio.toFixed(1)}:1</span>
          </li>
        );
      })}
    </ul>
  );
}
