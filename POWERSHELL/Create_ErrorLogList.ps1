# Creating ErrorLog List with Powershell
# Client side SharePoint Powershell is required.
# For further information visit: https://sharepointpowershell.codeplex.com/
# The fine tuned version is checked in into the project
# Change the import variales at the beginning 

$Pathofclientsidepowershell = "D:\work\AURUM\BCM\CLIENTSIDEPOWERSHELL\spps.psm1"
$Sharepointsite = "http:///"
$ErrorLogListName = "ErrorLog"
$ErrorLogListDescription = "Error log for the javascript elements of the application"

#get credentials
$secpasswd = ConvertTo-SecureString "Almafa12#" -AsPlainText -Force
$mycreds = New-Object System.Management.Automation.PSCredential ("aurum-consulting.de\daniel", $secpasswd)

# Include SPPS
Import-Module $Pathofclientsidepowershell

# Setup SPPS
Initialize-SPPS -siteURL $Sharepointsite -UserCredential $mycreds -Is2016 1

#Creating Testlist

Get-List($ErrorLogListName)
if ($global:listconstant -eq 0)
{
	Add-List -listTitle $ErrorLogListName -templateType "genericList" -Description $ErrorLogListDescription -QuickLaunch "off" -Hidden $true
	Add-TextFieldtoList -listTitle $ErrorLogListName -fieldName "ErrorMessage" -MaxNumberofChars 1024 -Required $false -enforceUniqueValues $false -indexed $false
	Add-TextFieldtoList -listTitle $ErrorLogListName -fieldName "ErrorSource" -MaxNumberofChars 1024 -Required $false -enforceUniqueValues $false -indexed $false
	Add-TextFieldtoList -listTitle $ErrorLogListName -fieldName "ErrorTime" -MaxNumberofChars 1024 -Required $false -enforceUniqueValues $false -indexed $false
	Add-NoteFieldtoList -listTitle $ErrorLogListName -fieldName "ErrorDetails" -NumberOfLines 10 -TextType "PlainText" -Required $false -enforceUniqueValues $false

	Write-Host "Succesfully created ErrorLogList on the site: $Sharepointsite" -foregroundcolor black -backgroundcolor green	
}
else
{



	Write-Host "ErrorLogList already exist on the site: $Sharepointsite" -foregroundcolor black -backgroundcolor yellow	

}

 