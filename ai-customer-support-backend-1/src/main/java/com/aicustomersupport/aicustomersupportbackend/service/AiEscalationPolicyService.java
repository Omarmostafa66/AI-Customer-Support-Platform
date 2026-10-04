package com.aicustomersupport.aicustomersupportbackend.service;

import com.aicustomersupport.aicustomersupportbackend.ai.AiChatMessage;
import com.aicustomersupport.aicustomersupportbackend.ai.AiChatResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AiEscalationPolicyService {

    private static final double LOW_CONFIDENCE_THRESHOLD = 0.55;
    private static final double MEDIUM_CONFIDENCE_THRESHOLD = 0.70;

    public Decision evaluate(
            String currentMessage,
            AiChatResponse aiResponse,
            List<AiChatMessage> conversation
    ) {

        if (aiResponse == null) {
            return new Decision(
                    true,
                    "AI response is unavailable."
            );
        }

        /*
         * IMPORTANT:
         *
         * If Gemini itself is temporarily unavailable,
         * this is NOT a customer issue that should automatically
         * create a support ticket.
         *
         * The customer can retry later.
         */
        if (!aiResponse.isAiAvailable()) {

            return new Decision(
                    false,
                    "AI service is temporarily unavailable; no escalation created."
            );
        }

        String message = normalize(currentMessage);

        String risk = normalize(
                aiResponse.getRisk()
        );

        double confidence =
                clamp(
                        aiResponse.getConfidence()
                );

        /*
         * Critical risk must always be escalated.
         */
        if ("CRITICAL".equals(risk)) {

            return new Decision(
                    true,
                    "Critical risk detected."
            );
        }

        /*
         * High risk must always be escalated.
         */
        if ("HIGH".equals(risk)) {

            return new Decision(
                    true,
                    "High risk detected."
            );
        }

        /*
         * Customer explicitly requested human support.
         */
        if (containsHumanSupportRequest(message)) {

            return new Decision(
                    true,
                    "Customer explicitly requested human support."
            );
        }

        /*
         * Security / account compromise.
         */
        if (containsSecurityRisk(message)) {

            return new Decision(
                    true,
                    "Security or unauthorized-account activity detected."
            );
        }

        /*
         * Financial / payment risk.
         */
        if (containsFinancialRisk(message)) {

            return new Decision(
                    true,
                    "Potential financial or payment risk detected."
            );
        }

        /*
         * AI cannot safely answer with very low confidence.
         */
        if (!aiResponse.isCanAnswer()
                && confidence < LOW_CONFIDENCE_THRESHOLD) {

            return new Decision(
                    true,
                    "AI confidence is too low for safe automatic support."
            );
        }

        /*
         * AI cannot resolve the issue and has explicitly
         * requested escalation.
         */
        if (!aiResponse.isCanResolve()
                && confidence < MEDIUM_CONFIDENCE_THRESHOLD
                && aiResponse.isEscalate()) {

            return new Decision(
                    true,
                    "AI cannot safely resolve the issue."
            );
        }

        /*
         * Repeated unresolved issue.
         */
        if (isRepeatedUnresolvedIssue(
                message,
                aiResponse,
                conversation
        )) {

            return new Decision(
                    true,
                    "Customer appears to be reporting a repeated unresolved issue."
            );
        }

        /*
         * AI requested escalation.
         */
        if (aiResponse.isEscalate()) {

            if (!aiResponse.isCanAnswer()) {

                return new Decision(
                        true,
                        "AI determined that additional human assistance is required."
                );
            }

            if (!aiResponse.isCanResolve()
                    && confidence >= MEDIUM_CONFIDENCE_THRESHOLD) {

                return new Decision(
                        true,
                        "AI cannot resolve the issue automatically."
                );
            }

            /*
             * Do not trust an AI escalation request by itself.
             * Server-side rules must support it.
             */
            return new Decision(
                    false,
                    "AI requested escalation without sufficient server-side escalation evidence."
            );
        }

        return new Decision(
                false,
                "Issue can continue through AI support."
        );
    }

    // =========================================================
    // Human Support Detection
    // =========================================================

    private boolean containsHumanSupportRequest(
            String message
    ) {

        return containsAny(
                message,

                "human",
                "real person",
                "real agent",
                "support agent",
                "customer service",
                "representative",
                "operator",
                "talk to someone",
                "talk to a person",
                "speak to someone",
                "speak to a person",
                "speak with an agent",
                "contact support",

                "موظف",
                "موظف دعم",
                "خدمة العملاء",
                "اكلم حد",
                "اكلم شخص",
                "عايز موظف",
                "عايز شخص",
                "عايز اكلم الدعم"
        );
    }

    // =========================================================
    // Security Risk
    // =========================================================

    private boolean containsSecurityRisk(
            String message
    ) {

        return containsAny(
                message,

                "hacked",
                "hack",
                "account compromised",
                "someone accessed my account",
                "someone logged into my account",
                "unauthorized access",
                "unauthorized login",
                "stolen account",
                "account takeover",
                "identity theft",
                "fraud",
                "scam",
                "stolen password",

                "اختراق",
                "حسابي اتسرق",
                "حد دخل على حسابي",
                "دخول غير مصرح",
                "احتيال",
                "نصب"
        );
    }

    // =========================================================
    // Financial Risk
    // =========================================================

    private boolean containsFinancialRisk(
            String message
    ) {

        return containsAny(
                message,

                "charged twice",
                "charged two times",
                "double charged",
                "money deducted twice",
                "money was deducted",
                "money taken",
                "wrong charge",
                "unknown charge",
                "unauthorized charge",
                "unauthorized transaction",
                "card charged",
                "payment deducted",
                "refund missing",
                "refund not received",

                "اتخصم مني مرتين",
                "اتخصم فلوس",
                "الفلوس اتخصمت",
                "خصم مرتين",
                "عملية غير مصرح بها",
                "خصم غير معروف",
                "الفلوس مرجعتش"
        );
    }

    // =========================================================
    // Repeated Unresolved Issue
    // =========================================================

    private boolean isRepeatedUnresolvedIssue(
            String currentMessage,
            AiChatResponse aiResponse,
            List<AiChatMessage> conversation
    ) {

        if (conversation == null
                || conversation.isEmpty()) {

            return false;
        }

        if (!containsRepeatSignal(currentMessage)) {

            return false;
        }

        int customerMessages = 0;
        int recentAiMessages = 0;

        for (AiChatMessage message : conversation) {

            if (message == null
                    || message.getText() == null
                    || message.getText().isBlank()) {

                continue;
            }

            String sender =
                    normalizeSender(
                            message.getSender()
                    );

            if ("customer".equals(sender)) {
                customerMessages++;
            }

            if ("ai".equals(sender)) {
                recentAiMessages++;
            }
        }

        return customerMessages >= 2
                && recentAiMessages >= 1
                && (
                !aiResponse.isCanResolve()
                        || aiResponse.isEscalate()
        );
    }

    // =========================================================
    // Repeat Signals
    // =========================================================

    private boolean containsRepeatSignal(
            String message
    ) {

        return containsAny(
                message,

                "again",
                "still",
                "same problem",
                "same issue",
                "doesn't work",
                "does not work",
                "not working",
                "didn't work",
                "did not work",
                "failed again",
                "happened again",
                "still failing",
                "still doesn't work",

                "تاني",
                "لسه",
                "نفس المشكلة",
                "نفس المشكلة تاني",
                "مش شغال",
                "لسه مش شغال",
                "لسه المشكلة",
                "حصل تاني",
                "فشل تاني"
        );
    }

    // =========================================================
    // Keyword Matching
    // =========================================================

    private boolean containsAny(
            String message,
            String... keywords
    ) {

        if (message == null
                || message.isBlank()) {

            return false;
        }

        for (String keyword : keywords) {

            if (message.contains(
                    keyword.toLowerCase(
                            Locale.ROOT
                    )
            )) {

                return true;
            }
        }

        return false;
    }

    // =========================================================
    // Normalize
    // =========================================================

    private String normalize(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    // =========================================================
    // Clamp Confidence
    // =========================================================

    private double clamp(
            double value
    ) {

        if (Double.isNaN(value)
                || Double.isInfinite(value)) {

            return 0.0;
        }

        return Math.max(
                0.0,
                Math.min(
                        1.0,
                        value
                )
        );
    }

    // =========================================================
    // Normalize Sender
    // =========================================================

    private String normalizeSender(
            String sender
    ) {

        if (sender == null) {
            return "customer";
        }

        if ("ai".equalsIgnoreCase(sender)
                || "assistant".equalsIgnoreCase(sender)
                || "bot".equalsIgnoreCase(sender)) {

            return "ai";
        }

        return "customer";
    }

    // =========================================================
    // Decision
    // =========================================================

    public static class Decision {

        private final boolean escalate;
        private final String reason;

        public Decision(
                boolean escalate,
                String reason
        ) {

            this.escalate = escalate;
            this.reason = reason;
        }

        public boolean isEscalate() {
            return escalate;
        }

        public String getReason() {
            return reason;
        }
    }
}