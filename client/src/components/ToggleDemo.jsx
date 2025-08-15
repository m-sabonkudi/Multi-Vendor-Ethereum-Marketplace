import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

function ToggleDemo() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="custom-toggle"
        checked={isOn}
        onCheckedChange={setIsOn}
      />
      <Label htmlFor="custom-toggle">{isOn ? "ON" : "OFF"}</Label>
    </div>
  );
}

export default ToggleDemo;
