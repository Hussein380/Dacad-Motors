import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Phone, Mail, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { createInquiry } from '@/services/inquiryService';
import { toast } from 'sonner';
import { type Car } from '@/types';

interface InquiryFormProps {
    car: Car;
}

export function InquiryForm({ car }: InquiryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        email: '',
        phone: '',
        message: 'I am interested in this car. Is it still available?',
        type: 'General Inquiry',
        requestTestDrive: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, type: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createInquiry({
                carId: car.id || car._id,
                ...formData,
                type: formData.requestTestDrive ? 'Test Drive' : formData.type as any
            });
            setIsSuccess(true);
            toast.success('Inquiry sent successfully! We will contact you soon.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send inquiry');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <Card className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-display font-bold">Inquiry Sent!</h3>
                <p className="text-muted-foreground">
                    Thank you for your interest in the {car.brand} {car.model}. Our team will get back to you shortly via email or phone.
                </p>
                <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                    Send Another Inquiry
                </Button>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 space-y-6">
                <h3 className="font-display font-semibold text-xl flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    Contact Seller
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                id="customerName"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className="pl-9"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-9"
                                    placeholder="+254..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Inquiry Type</Label>
                        <Select onValueChange={handleSelectChange} defaultValue={formData.type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Inquiry Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                <SelectItem value="Test Drive">Test Drive</SelectItem>
                                <SelectItem value="Purchase Offer">Make an Offer</SelectItem>
                                <SelectItem value="Trade-In">Trade-In Query</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="I am interested in this car..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="testDrive"
                            checked={formData.requestTestDrive}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({ ...prev, requestTestDrive: checked as boolean }))
                            }
                        />
                        <label
                            htmlFor="testDrive"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I would like to schedule a test drive
                        </label>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full gradient-accent text-white font-semibold h-12 text-lg shadow-lg hover:shadow-xl transition-all"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        'Sending...'
                    ) : (
                        <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Inquiry
                        </>
                    )}
                </Button>
            </Card>
        </form>
    );
}
