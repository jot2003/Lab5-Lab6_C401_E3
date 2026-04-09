"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { loginAccount } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginAccount(studentId, studentName);
    setStatus(result);
    if (result.ok) {
      setTimeout(() => router.push("/nguoi-dung"), 500);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 py-8">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="size-4" />
            Đăng nhập
          </CardTitle>
          <CardDescription>
            Đăng nhập bằng mã sinh viên và họ tên để truy cập thông tin người dùng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label htmlFor="student-id-login" className="text-xs text-muted-foreground">Mã sinh viên</label>
              <Input
                id="student-id-login"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="VD: 2A202600205"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="student-name-login" className="text-xs text-muted-foreground">Họ tên</label>
              <Input
                id="student-name-login"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
              />
            </div>

            {status && (
              <div className={status.ok ? "rounded-lg border border-success/30 bg-success/10 p-3 text-xs" : "rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs"}>
                {status.message}
              </div>
            )}

            <Button type="submit" className="w-full">Đăng nhập</Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Chưa có tài khoản? <Link href="/dang-ky" className="text-primary underline">Đăng ký</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
