#----------------------------------------------------------------------------- 
# Filename : spps.subsites.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Contains methods to manage subsites

function Add-Subsite
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$title,
		
		[Parameter(Mandatory=$false, Position=2)]
	    [string]$webTemplate = "STS#0",
		
		[Parameter(Mandatory=$false, Position=3)]
	    [string]$description = "",
		
		[Parameter(Mandatory=$false, Position=4)]
	    [string]$url = "",
		
		[Parameter(Mandatory=$false, Position=5)]
	    [int]$language = 1033,
		
		[Parameter(Mandatory=$false, Position=6)]
	    [bool]$useSamePermissionsAsParentSite = $true
	)
	Write-Host "Creating subsite $title" -foregroundcolor black -backgroundcolor yellow
	
	# Set url with title value when no url is set
	if ($url -eq "")
	{
		$url = $title
	}
	
	$global:webCreationInfo = new-object Microsoft.SharePoint.Client.WebCreationInformation
	$webCreationInfo.Title = $title
	$webCreationInfo.Description = $description
	$webCreationInfo.Language = $language
	$webCreationInfo.Url = $url
	$webCreationInfo.UseSamePermissionsAsParentSite = $useSamePermissionsAsParentSite
	$webCreationInfo.WebTemplate = $webTemplate
	
	$newSite = $Spps.Web.Webs.Add($webCreationInfo)
		
    try {
	    
        $Spps.ExecuteQuery()
        Write-Host "Subsite $title succesfully created" -foregroundcolor black -backgroundcolor green

    }	
    catch
    {
        $usefulerror = $Error[0].Exception.InnerException.Message
        Write-host "# Creation Failed  #" -BackgroundColor Red -ForegroundColor White 
        Write-Host "$usefulerror" -foregroundcolor black -backgroundcolor yellow

    }
}

function Open-Site
{
    [CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$relativeUrl
	)

	Write-Host "Go to site $relativeUrl" -foregroundcolor black -backgroundcolor yellow
	
    [string]$newSiteUrl = Join-Parts -Separator '/' -Parts $rootSiteUrl, $relativeUrl
    
    $NewSpps = New-Object Microsoft.SharePoint.Client.ClientContext($newSiteUrl)

    $NewSpps.RequestTimeout = $Spps.RequestTimeout	
    $NewSpps.AuthenticationMode = $Spps.AuthenticationMode
    $NewSpps.Credentials = $Spps.Credentials

	Write-Host "Check connection" -foregroundcolor black -backgroundcolor yellow
	$web = $NewSpps.Web
	$site = $NewSpps.Site
	$NewSpps.Load($web)
	$NewSpps.Load($site)
	$NewSpps.ExecuteQuery()
	
	Set-Variable -Name "Spps" -Value $NewSpps -Scope Global

    Write-Host "Succesfully connected" -foregroundcolor black -backgroundcolor green
}

function Open-Subsite
{
    [CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$relativeUrl
	)

    Open-Site -relativeUrl $relativeUrl
}

function Open-Rootsite
{
    Open-Site -relativeUrl "/"
}