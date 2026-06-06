import { useNavigate } from "react-router-dom";
import { Brandmark } from "../components/ui";
import { useStore } from "../lib/store";

export function Welcome() {
  const nav = useNavigate();
  const { set } = useStore();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-readable flex-col px-6 py-12 md:py-20">
        <div className="mb-8">
          <Brandmark size={48} tagline />
        </div>

        <h1 className="text-4xl leading-tight md:text-5xl">
          A calm look at your health, every morning.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          HeartSum gathers the numbers from your Apple Watch and your blood
          tests into one easy place. It learns what's normal for you, gently
          points out anything worth noticing, and gets you ready for your
          doctor — all in plain English.
        </p>

        <div className="mt-8 space-y-3">
          <div className="card p-5">
            <h2 className="text-lg">What HeartSum is</h2>
            <p className="mt-1 text-muted">
              An early-warning helper and a bridge to your doctor. Most days
              it'll simply tell you you're steady. Now and then, it'll gently
              flag something worth a look.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="text-lg">What it isn't</h2>
            <p className="mt-1 text-muted">
              It is <strong>not</strong> a diagnosis, and it will never tell you
              to start, stop, or change any medication or treatment. That's
              always a conversation for you and a real clinician.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            className="btn-primary flex-1"
            onClick={() => nav("/profile")}
          >
            Get started
          </button>
          <button
            className="btn-ghost flex-1"
            onClick={() => {
              set({ setUpByCarer: true } as never);
              nav("/profile");
            }}
          >
            I'm helping a family member set this up
          </button>
        </div>
      </div>
    </div>
  );
}
