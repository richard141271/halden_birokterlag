import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveNews } from "@/features/news/server";

export default function AdminNewNewsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opprett nyhet</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveNews} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel</Label>
            <Input id="title" name="title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Kort ingress</Label>
            <Textarea id="summary" name="summary" className="min-h-24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Innhold</Label>
            <Textarea id="body" name="body" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author_name">Forfatter</Label>
            <Input id="author_name" name="author_name" defaultValue="Admin" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="is_published" />
            Publiser med en gang
          </label>
          <Button type="submit">Lagre nyhet</Button>
        </form>
      </CardContent>
    </Card>
  );
}
