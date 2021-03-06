#----------------------------------------------------------------------------- 
# Filename : spps.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Includes CSOM and all necessary scripts
#
# Amendments made by Ryan Yates on 12/04/2015
#


# global vars
$spps
$rootSiteUrl

#the $PSScriptRoot variable changes over time so let's stick the value to our own variable
$scriptdir = $PSScriptRoot

# include other modules
Import-Module "$scriptdir\spps.global.psm1"
Import-Module "$scriptdir\spps.lists.psm1"
Import-Module "$scriptdir\spps.webparts.psm1"
Import-Module "$scriptdir\spps.masterpages.psm1"
Import-Module "$scriptdir\spps.usersandgroups.psm1"
Import-Module "$scriptdir\spps.features.psm1"
Import-Module "$scriptdir\spps.subsites.psm1"
Import-Module "$scriptdir\spps.solutions.psm1"
Import-Module "$scriptdir\spps.SiteColumns.psm1"
Import-Module "$scriptdir\spps.ContentTypes.psm1"
Import-Module "$scriptdir\spps.other.psm1"

Function Test-SPPS
{
$clientOnline = Test-Path "$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.dll"
$Clientruntimeonline = Test-path "$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.Runtime.dll"
$client2010 = test-path "$env:CommonProgramFiles\Microsoft Shared\SharePoint Client\Microsoft.SharePoint.Client.Dll"
$client2010runtime = test-path "$env:CommonProgramFiles\Microsoft Shared\SharePoint Client\Microsoft.SharePoint.Client.Runtime.Dll"
$client2013 = Test-Path "$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\15\ISAPI\Microsoft.SharePoint.Client.dll"
$client2013Runtime = Test-Path "$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\15\ISAPI\Microsoft.SharePoint.Client.Runtime.dll"

$2010dlls = "http://www.microsoft.com/en-gb/download/details.aspx?id=21786"
$2013dlls = "http://www.microsoft.com/en-us/download/details.aspx?id=35585"
$onlinedlls = "http://www.microsoft.com/en-us/download/details.aspx?id=42038"

if ($client2010 -eq $true -and $Client2010runtime -eq $true)
    {
    Write-host "Ready to Connect to SharePoint 2010" -ForegroundColor Green
    }
    else
    {
     start iexplore $2010dlls -WindowStyle Maximized
    }

if ($client2013 -eq $true -and $Client2013runtime -eq $true)
    {
    Write-host "Ready to Connect to SharePoint 2013" -ForegroundColor Green
    }
    else
    {
    start iexplore $2013dlls -WindowStyle Maximized
    }

 if ($clientonline -eq $true -and $Clientruntimeonline -eq $true)
    {
    Write-host "Ready to Connect to SharePoint Online" -ForegroundColor Green
    }
    else
    {
    start iexplore $onlinedlls -WindowStyle Maximized
    }   
    
}


function Initialize-SPPS
{
	[CmdletBinding()]
	param
	(
	    [Parameter(Mandatory=$true, Position=1)]
	    [string]$siteURL,

        [Parameter(Mandatory=$false,Position=2)]
	    [System.Management.Automation.PSCredential]$UserCredential,
        
        [Parameter(Mandatory=$false,Position=3)]
	    [Bool]$IsOnline = $false,

        [Parameter(Mandatory=$false,Position=4)]
	    [Bool]$Is2010 = $false,

        [Parameter(Mandatory=$false,Position=4)]
	    [Bool]$Is2016 = $false,

        [Parameter(Mandatory=$false,Position=5)]
	    [String]$OnlineUsername,

        [Parameter(Mandatory=$false,Position=6)]
	    [String]$OnlinePassword

     )
                  
        $Online = $IsOnline
        $version = $Is2010
        
    Write-Host "Loading the CSOM library" -foregroundcolor black -backgroundcolor yellow
    Write-host ""
	if ($Is2016 -eq $true)
	{
		[void][Reflection.Assembly]::LoadFrom("C:\Windows\Microsoft.NET\assembly\GAC_MSIL\Microsoft.SharePoint.Client\v4.0_16.0.0.0__71e9bce111e9429c\Microsoft.SharePoint.Client.dll")
		[Void][Reflection.Assembly]::LoadFrom("C:\Windows\Microsoft.NET\assembly\GAC_MSIL\Microsoft.SharePoint.Client.Runtime\v4.0_16.0.0.0__71e9bce111e9429c\Microsoft.SharePoint.Client.Runtime.dll")
		Write-Host "Succesfully loaded the CSOM library for SharePoint 2016" -foregroundcolor black -backgroundcolor green	
	}	
    elseif($Online -eq $true)
    { 
		[void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.dll")
		[Void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\16\ISAPI\Microsoft.SharePoint.Client.Runtime.dll")
		Write-Host "Succesfully loaded the CSOM library for SharePoint 2016" -foregroundcolor black -backgroundcolor green
    }
    elseif($version -eq $true)
    {
    [void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\SharePoint Client\Microsoft.SharePoint.Client.dll")
    [void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\SharePoint Client\Microsoft.SharePoint.Client.Runtime.dll")
	Write-Host "Succesfully loaded the CSOM library for SharePoint 2010" -foregroundcolor black -backgroundcolor green
    }
    elseif($version -eq $false)
    {
    [void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\15\ISAPI\Microsoft.SharePoint.Client.dll")
    [void][Reflection.Assembly]::LoadFrom("$env:CommonProgramFiles\Microsoft Shared\Web Server Extensions\15\ISAPI\Microsoft.SharePoint.Client.Runtime.dll")
    Write-Host "Succesfully loaded the CSOM library for SharePoint 2013" -foregroundcolor black -backgroundcolor green
    }
    Write-host ""
    $Global:Spps = New-Object Microsoft.SharePoint.Client.ClientContext($siteURL)
	
	$Spps.RequestTimeOut = 1000 * 60 * 10;
    
    if($UserCredential -and ($online -eq $false))
    {
    $Spps.Credentials = $UserCredential
    $username = $UserCredential.UserName
    }
    elseif($Online -eq $true -and $UserCredential)
    {
    $SpoCreds = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($UserCredential.UserName,$UserCredential.Password)
    $spps.Credentials = $SpoCreds
    $username = $SpoCreds.UserName
    }
    elseif($online -eq $true -and (!$OnlineUsername -and !$OnlinePassword))
	{
     $username = Read-Host "Provide Username"
     $password = Read-Host "Provide Password" -AsSecureString
	 Write-Host "Setting SharePoint Online credentials" -foregroundcolor black -backgroundcolor yellow
	 Write-host ""
     $Spps.AuthenticationMode = [Microsoft.SharePoint.Client.ClientAuthenticationMode]::Default
	 $credentials = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($username,$Password)
	 $Spps.Credentials = $credentials
	 }
    Elseif($online -eq $true -and $OnlineUsername -and $OnlinePassword)
    {
    $Password = ConvertTo-SecureString $OnlinePassword -AsPlainText -Force
     Write-Host "Setting SharePoint Online credentials" -foregroundcolor black -backgroundcolor yellow
	 Write-host ""
     $Spps.AuthenticationMode = [Microsoft.SharePoint.Client.ClientAuthenticationMode]::Default
	 $credentials = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($onlineusername,$Password)
	 $Spps.Credentials = $credentials
     $username = $OnlineUsername
    }
    else
    {    
    $username = "$env:USERDOMAIN\$env:USERNAME"
    }
       
	$global:web = $Spps.Web;
	$global:site = $Spps.Site;
	$Spps.Load($web);
	$Spps.Load($site);
	$Spps.ExecuteQuery()
	
	Set-Variable -Name "rootSiteUrl" -Value $siteURL -Scope Global
	
    Write-Host "Succesfully connected to $siteurl as $username" -foregroundcolor black -backgroundcolor green
    Write-Host ""
    Write-host "Variable " -ForegroundColor Green -NoNewline
    Write-Host '$Spps' -ForegroundColor Red -NoNewline 
    Write-host " is now in use for the Client Context"-ForegroundColor Green
    Write-host 'Use this for when you need to execute querys in form of $Spps.ExecuteQuery()' -ForegroundColor Green
    Write-Host ""
    Write-host "Variable " -ForegroundColor Green -NoNewline
    Write-Host '$Site' -ForegroundColor Red -NoNewline 
    Write-host " is now in use for the Site Context" -ForegroundColor Green
    Write-Host 'Use this for when you need to get data from the site in the form of $site.Url' -ForegroundColor Green
    Write-Host ""
    Write-host "Variable " -ForegroundColor Green -NoNewline
    Write-Host '$web' -ForegroundColor Red -NoNewline 
    Write-host " is now in use for the Web Context" -ForegroundColor Green
    Write-host 'Use this for when you need to get data from the web object s in form of $web.title' -ForegroundColor Green

}

