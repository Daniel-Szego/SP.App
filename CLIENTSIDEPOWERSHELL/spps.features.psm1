#----------------------------------------------------------------------------- 
# Filename : spps.features.ps1 
#----------------------------------------------------------------------------- 
# Author : Jeffrey Paarhuis
#----------------------------------------------------------------------------- 
# Contains methods to manage site collection and site features


Function Get-Features
{
$Global:Sitefeatures = $site.Features
$Spps.Load($Sitefeatures)
$Spps.ExecuteQuery()

$Global:webfeatures = $web.Features
$Spps.Load($webfeatures)
$Spps.ExecuteQuery()
}

function Enable-Feature
{
	[CmdletBinding()]
	param
	(
		[Parameter(Mandatory=$true, Position=1)]
	    [string]$featureId,
		
		[Parameter(Mandatory=$true, Position=2)]
	    [bool]$force,
		
		[Parameter(Mandatory=$true, Position=3)]
	    [Microsoft.SharePoint.Client.FeatureDefinitionScope]$featureDefinitionScope
	)
	Write-Host "Enabling feature $featureId on $featureDefinitionScope" -foregroundcolor black -backgroundcolor yellow
		
	$featureGuid = new-object System.Guid $featureId
		
	$features = $null	
	
	if ($featureDefinitionScope -eq [Microsoft.SharePoint.Client.FeatureDefinitionScope]::Site)
	{
	
		$features = $Spps.Site.Features
		
	} else {
	
		$features = $Spps.Web.Features
		
	}
	$Spps.Load($features)
	$Spps.ExecuteQuery()
	
	$feature = $features.Add($featureGuid, $force, [Microsoft.SharePoint.Client.FeatureDefinitionScope]::None)
	
	# TODO: Check if the feature is already enabled
	$Spps.ExecuteQuery()
	
	Write-Host "Feature succesfully enabled" -foregroundcolor black -backgroundcolor green
}