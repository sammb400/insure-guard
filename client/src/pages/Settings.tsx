import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Monitor, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useState, useRef, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function ImageCropper({ imageSrc, onCancel, onCrop }: { imageSrc: string, onCancel: () => void, onCrop: (base64: string) => void }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    
    const containerSize = 256;
    const scaleX = containerSize / naturalWidth;
    const scaleY = containerSize / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY);
    setScale(initialScale);
    
    setPosition({
      x: (containerSize - naturalWidth * initialScale) / 2,
      y: (containerSize - naturalHeight * initialScale) / 2
    });
  };

  const handleSave = () => {
    if (!imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(
      imgRef.current, 
      position.x, 
      position.y, 
      imgDimensions.width * scale, 
      imgDimensions.height * scale
    );

    onCrop(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div 
          className="relative w-64 h-64 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 cursor-move bg-slate-50 dark:bg-slate-900 touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="Crop preview" 
            className="absolute max-w-none origin-top-left select-none pointer-events-none"
            style={{ 
              transform: `translate(${position.x}px, ${position.y}px)`,
              width: `${imgDimensions.width * scale}px`,
              height: `${imgDimensions.height * scale}px`,
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Zoom</span>
          <span>{Math.round(scale * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="3" 
          step="0.05" 
          value={scale} 
          onChange={(e) => setScale(parseFloat(e.target.value))} 
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Avatar</Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().photoURL) {
          setAvatar(docSnap.data().photoURL);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Allow larger files since we resize them, but keep a sanity limit (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Please choose an image smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleCropSave = async (base64String: string) => {
    if (!user) return;
    
    setCropModalOpen(false);
    setUploading(true);
    
    try {
      await setDoc(doc(db, "users", user.uid), { photoURL: base64String }, { merge: true });
      setAvatar(base64String);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to save avatar");
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your photo and personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || user?.photoURL || undefined} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Change Avatar
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.displayName || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how InsureGuard looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Theme Mode</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      variant={theme === "light" ? "default" : "outline"} 
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-5 w-5" />
                      <span>Light</span>
                    </Button>
                    <Button 
                      variant={theme === "dark" ? "default" : "outline"} 
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-5 w-5" />
                      <span>Dark</span>
                    </Button>
                    <Button 
                      variant={theme === "system" ? "default" : "outline"} 
                      className="flex flex-col gap-2 h-20"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-5 w-5" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="policy-expires" className="flex flex-col space-y-1">
                    <span>Policy Expiration Alerts</span>
                    <span className="font-normal text-muted-foreground">Receive emails when policies are expiring soon.</span>
                  </Label>
                  <Switch id="policy-expires" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing" className="flex flex-col space-y-1">
                    <span>Marketing Emails</span>
                    <span className="font-normal text-muted-foreground">Receive updates about new features.</span>
                  </Label>
                  <Switch id="marketing" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
          <DialogContent className="sm:max-w-[400px] !fixed !left-[50%] !top-[50%] !translate-x-[-50%] !translate-y-[-50%] z-50">
            <DialogHeader>
              <DialogTitle>Adjust Avatar</DialogTitle>
              <DialogDescription>
                Drag to position and use the slider to zoom.
              </DialogDescription>
            </DialogHeader>
            {selectedImage && (
              <ImageCropper 
                imageSrc={selectedImage} 
                onCancel={() => setCropModalOpen(false)} 
                onCrop={handleCropSave} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
