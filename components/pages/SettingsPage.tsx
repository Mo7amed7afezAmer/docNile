"use client";

import {
  Key,
  Users,
  FileText,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";

const apiKeys = [
  {
    name: "Production API Key",
    key: "mshld_prod_sk_...7f3a",
    created: "Jan 10, 2024",
    lastUsed: "2 hours ago",
    active: true,
  },
  {
    name: "Staging API Key",
    key: "mshld_stg_sk_...b2c1",
    created: "Dec 22, 2023",
    lastUsed: "3 days ago",
    active: true,
  },
  {
    name: "Development Key",
    key: "mshld_dev_sk_...9e4d",
    created: "Nov 15, 2023",
    lastUsed: "1 week ago",
    active: false,
  },
];

const users = [
  {
    name: "Dr. Sarah Chen",
    email: "sarah.chen@hospital.org",
    role: "Admin",
    status: "Active",
  },
  {
    name: "James Miller",
    email: "james.miller@hospital.org",
    role: "Reviewer",
    status: "Active",
  },
  {
    name: "Dr. Amy Patel",
    email: "amy.patel@research.edu",
    role: "Client",
    status: "Active",
  },
  {
    name: "Robert Kim",
    email: "r.kim@hospital.org",
    role: "Reviewer",
    status: "Invited",
  },
];

const templates = [
  {
    name: "Standard HIPAA",
    description: "Default PHI removal — names, dates, MRN, addresses",
    fields: 18,
    isDefault: true,
  },
  {
    name: "Research Safe Harbor",
    description: "18 HIPAA identifiers with date shifting",
    fields: 18,
    isDefault: false,
  },
  {
    name: "Radiology Reports",
    description: "Custom rules for radiology-specific PHI",
    fields: 12,
    isDefault: false,
  },
];

const roleColors: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Reviewer: "bg-info/10 text-info",
  Client: "bg-success/10 text-success",
};

const SettingsPage = () => {
  const [showKey, setShowKey] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage templates, API keys, and team access
        </p>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger
            value="templates"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" /> Templates
          </TabsTrigger>
          <TabsTrigger
            value="api-keys"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Key className="w-4 h-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4" /> Team
          </TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Anonymization Templates
            </h2>
            <Button
              className="gradient-primary text-primary-foreground font-semibold gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" /> New Template
            </Button>
          </div>
          <div className="grid gap-3">
            {templates.map((tpl) => (
              <Card key={tpl.name} className="shadow-card border-border/60">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {tpl.name}
                      </p>
                      {tpl.isDefault && (
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-0 text-xs"
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tpl.description} · {tpl.fields} fields
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              API Key Management
            </h2>
            <Button
              className="gradient-primary text-primary-foreground font-semibold gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Generate Key
            </Button>
          </div>
          <div className="grid gap-3">
            {apiKeys.map((key, i) => (
              <Card key={i} className="shadow-card border-border/60">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                    <Key className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {key.name}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`border-0 text-xs ${key.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {key.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-muted-foreground font-mono">
                        {showKey === i
                          ? "mshld_prod_sk_a8f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9"
                          : key.key}
                      </code>
                      <button
                        onClick={() =>
                          setShowKey(showKey === i ? null : i)
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showKey === i ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {key.created} · Last used {key.lastUsed}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Team Members
            </h2>
            <Button
              className="gradient-primary text-primary-foreground font-semibold gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" /> Invite Member
            </Button>
          </div>
          <Card className="shadow-card border-border/60">
            <CardContent className="p-0">
              {users.map((user, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`border-0 text-xs font-semibold ${roleColors[user.role] || ""}`}
                  >
                    {user.role}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`border-0 text-xs ${user.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                  >
                    {user.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default SettingsPage;
