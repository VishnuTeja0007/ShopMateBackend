import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Play, ExternalLink, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EndpointProps {
  method: string;
  path: string;
  title: string;
  description: string;
  isProtected?: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: string;
  responseExample?: string;
  notes?: string;
}

const methodColors = {
  GET: "bg-blue-100 text-blue-800",
  POST: "bg-green-100 text-green-800",
  PUT: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-800",
};

export default function ApiEndpoint({
  method,
  path,
  title,
  description,
  isProtected = false,
  parameters = [],
  requestBody,
  responseExample,
  notes,
}: EndpointProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const handleTryIt = () => {
    toast({
      title: "Try it functionality",
      description: "Interactive API testing would be implemented here",
    });
  };

  return (
    <Card className="mb-12 overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`text-sm font-medium ${methodColors[method as keyof typeof methodColors]}`}>
              {method}
            </Badge>
            <code className="text-lg font-mono text-slate-900">{path}</code>
            {isProtected && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                Protected
              </Badge>
            )}
          </div>
          <Button onClick={handleTryIt} className="bg-blue-600 hover:bg-blue-700">
            <Play size={16} className="mr-2" />
            Try it
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>

        {notes && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Note:</strong> {notes}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="response">Response</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {parameters.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Parameters</h4>
                <div className="space-y-3">
                  {parameters.map((param) => (
                    <div key={param.name} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {param.name}
                        </code>
                        {param.required && (
                          <Badge variant="destructive" className="text-xs">
                            required
                          </Badge>
                        )}
                        <span className="text-sm text-slate-600">{param.type}</span>
                      </div>
                      <p className="text-sm text-slate-600">{param.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isProtected && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Protected endpoint:</strong> Requires authentication. Include the JWT token in the Authorization header.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            {isProtected && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Headers</h4>
                <div className="bg-slate-900 rounded-lg p-4 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Authorization: Bearer <jwt-token>")}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
                  >
                    <Copy size={16} />
                  </Button>
                  <pre className="text-sm text-slate-300 font-mono">
                    <code>Authorization: Bearer &lt;jwt-token&gt;</code>
                  </pre>
                </div>
              </div>
            )}

            {requestBody && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Request Body</h4>
                <div className="bg-slate-900 rounded-lg p-4 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(requestBody)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
                  >
                    <Copy size={16} />
                  </Button>
                  <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                    <code>{requestBody}</code>
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            {responseExample && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Response Example</h4>
                <div className="bg-slate-900 rounded-lg p-4 relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(responseExample)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
                  >
                    <Copy size={16} />
                  </Button>
                  <pre className="text-sm text-slate-300 font-mono overflow-x-auto">
                    <code>{responseExample}</code>
                  </pre>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
