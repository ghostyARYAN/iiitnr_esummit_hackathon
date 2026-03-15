import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is Parivesh 3.0?",
      answer: "Parivesh 3.0 is a web-based workflow application for online submission and monitoring of the proposals submitted by the proponents for seeking Environment, Forest, Wildlife and CRZ Clearances from Central, State and District level authorities."
    },
    {
      question: "How do I submit a new application?",
      answer: "To submit a new application, log in to your Proponent Dashboard, click on the 'New Application' button, select the appropriate sector and category, and fill in the required details in the application form."
    },
    {
      question: "What documents are required for EC Application?",
      answer: "The required documents vary based on the sector and category of your project. Generally, you will need to upload the Conceptual Plan, Feasibility Report, and other relevant documents as specified in the checklist for your specific category."
    },
    {
      question: "How can I track the status of my application?",
      answer: "You can track the status of your application from the Dashboard. The status is updated in real-time as your application moves through different stages of scrutiny and approval."
    },
    {
      question: "What should I do if my application is returned with queries?",
      answer: "If your application is returned with queries (EDS/ADS), you need to address the queries raised by the authority and resubmit the application with the necessary clarifications or additional documents."
    },
    {
      question: "How do I contact technical support?",
      answer: "If you face any technical issues, you can contact our support team via the 'Contact Us' section or email us at support@parivesh.nic.in."
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:pl-2 transition-all" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Find answers to common questions about the Parivesh 3.0 portal and application process.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Queries</CardTitle>
            <CardDescription>
              Common questions about using the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
            <CardDescription>
              Can't find the answer you're looking for? Please chat to our friendly team.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center items-center p-6">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.location.href = 'mailto:support@parivesh.nic.in'}>
              <Mail className="mr-2 h-4 w-4" />
              Email Support
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Phone className="mr-2 h-4 w-4" />
              +91 11 2469 5242
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
