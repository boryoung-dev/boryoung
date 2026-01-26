import Link from "next/link";
import { Button, Card, CardHeader, CardContent } from "@repo/ui";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col items-center p-24 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-3xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            ← Back to List
          </Button>
        </Link>
        
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">Detail Page</h1>
            <p className="text-zinc-500">ID: {id}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="leading-7">
                This is the detail view for item <span className="font-mono font-bold">{id}</span>.
              </p>
              <div className="h-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4">
                <p className="text-sm text-zinc-500">
                  Content placeholder for item {id}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
