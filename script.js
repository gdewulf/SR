// Define constants
def jiraBaseUrl = "https://support-bci-sandbox-102.atlassian.net"
def apiUrl = "${jiraBaseUrl}/rest/api/3/bulk/issues/move"
def auth = "c3MtYXBwbGljYXRpb25hZG1pbmlzdHJhdGlvbkBzaGFyZWRzdmNzLmNvbTpBVEFUVDN4RmZHRjBfZnNVZnZZcWtYcmZ0S0RjZlhyVEpZU3lxak9JWWlhNmRWbllKOURsQ3R0U2NDRWFYMW5EbjZvUkhRMXI4OFl4WGFxY2pVWTBDZkdQV0N1b3pTbXRmbkRjVWlnd3FDOVFQTkhLVkI3eEhwTE1sS3VWR3BkcTQxRHZ2S21TTUFXZ1k5MjNFWmxKQ2V6ZmJ1SVJ0MXJuYWduVlFMWGg1LXhZaUpQTDdqVTk3c1k9OTlGODU3RDY="  // Your encoded auth

// Access event data
def issue = event.issue
def changeLog = event.changeLog

// Debug log for changeLog
logger.info("ChangeLog details: ${changeLog?.items?.collect { "Field: ${it.field} (ID: ${it.fieldId}), To: ${it.to}" }?.join('; ') ?: 'No items'}")

// Check if this is an update to customfield_14266 
def handoffValue = issue.fields.customfield_14266?.value
if (!handoffValue) {
logger.info("Move to Project field is empty. Skipping.")
return
}

// Find the cloner issue key (original in DATASD) 
def clonerLink = issue.fields.issuelinks?.find { link ->
link.type?.outward == "clones" && link.outwardIssue
}
def clonerKey = clonerLink?.outwardIssue?.key

// Build Bulk Move API payload for single issue to ITSD
def payload = [
    sendBulkNotification: true,
    targetToSourcesMapping: [
        "ITSD,10020": [  // Hardcoded to ITSD with issue type ID 10020
            inferFieldDefaults: true,
            inferStatusDefaults: true,
            inferSubtaskTypeDefault: true,
            issueIdsOrKeys: [clonerKey]
        ]
    ]
]

// Execute the API call
try {
    def response = Unirest.post(apiUrl)
        .header("Authorization", "Basic ${auth}")
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .body(payload)
        .asJson()
    
    if (response.status == 200 || response.status == 202) {
        logger.info("Successfully moved cloner ${clonerKey} to ITSD for clone ${issue.key}")
    } else {
        logger.error("Failed to move cloner ${clonerKey}: Status ${response.status}, Body: ${response.body}")
    }
} catch (Exception e) {
    logger.error("Exception during Bulk Move API call: ${e.message}")
}
