import { useWalkFrame, walkFrameSrc } from "@/lib/walkFrames";

const FPS = 8;

export default function WalkingCat() {
  const frame = useWalkFrame(FPS);
  return (
    <div className="walk-cat" aria-hidden="true">
      <img src={walkFrameSrc(frame)} alt="" draggable={false} />
    </div>
  );
}
